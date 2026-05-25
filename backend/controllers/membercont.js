const attendancemodel = require("../models/attendance");
const auditlogs = require("../models/auditlogs");
const usermodel = require("../models/user");

const getMyProfile = async (req, res) => {
  try {
    const user = await usermodel.findById(req.params.id).populate("organizationId").populate("assignedZones");
    if (!user) {
      return res.status(404).json({message: "User not found"});
    }
    const attendance = await attendancemodel.find({userId: user._id}).sort({ createdAt: -1 });
    const logs = await auditlogs.find({
      targetUserId: user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      user,
      attendance,
      logs,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ── Geo helper (inline) ─────────────────────────────────────────────────────
const isInsideZone = (lat, lng, zone) => {

  const R = 6371000;

  const dLat =
    ((zone.lat - lat) * Math.PI) / 180;

  const dLng =
    ((zone.lng - lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat * Math.PI) / 180) *
    Math.cos((zone.lat * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;

  const dist =
    R *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return dist <= zone.radius;
};
 
const distanceFromZone = (lat, lng, zone) => {

  const R = 6371000;

  const dLat =
    ((zone.lat - lat) * Math.PI) / 180;

  const dLng =
    ((zone.lng - lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat * Math.PI) / 180) *
    Math.cos((zone.lat * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;

  const dist =
    R *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return Math.round(dist - zone.radius);
};
 
// ── Controller ──────────────────────────────────────────────────────────────
const punchAttendance = async (req, res) => {
  try {
    const { userId, action, lat, lng } = req.body;
 
    if (!userId || !action) {
      return res.status(400).json({ message: 'userId and action are required' });
    }
    if (!['in', 'out'].includes(action)) {
      return res.status(400).json({ message: 'action must be "in" or "out"' });
    }
    if (lat == null || lng == null) {
      return res.status(400).json({ message: 'lat and lng are required' });
    }
 
    const user = await usermodel.findById(userId).populate('assignedZones');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
 
    const today = new Date().toISOString().split('T')[0];
 
    // ==========================================================================
    // PUNCH IN
    // ==========================================================================
 
    if (action === 'in') {
 
      const alreadyPunchedIn = await attendancemodel.findOne({
        userId: user._id,
        date: today,
        status: 'punched_in',
      });
 
      if (alreadyPunchedIn) {
        return res.status(400).json({ message: 'Already punched in today' });
      }
 
      let assignedZoneId = null;
 
      // MODE A — must be inside a zone
      if (user.attendanceMode === 'A') {
 
       const activeZones = user.assignedZones;
 
        if (!activeZones.length) {
          return res.status(400).json({ message: 'No active zone assigned. Contact your admin.' });
        }
 
        const matchedZone = activeZones.find((z) => isInsideZone(lat, lng, z));
 
        if (!matchedZone) {
          // Find closest zone for accurate distance message
          const closestZone = activeZones.reduce((closest, zone) => {
            return distanceFromZone(lat, lng, zone) < distanceFromZone(lat, lng, closest)
              ? zone : closest;
          });
          const dist = distanceFromZone(lat, lng, closestZone);
 
          return res.status(403).json({
            message: `You are ${dist} m outside your assigned zone.`,
            distanceFromZone: dist,
            zoneName: closestZone.name,
          });
        }
 
        assignedZoneId = matchedZone._id;
      }
 
      // MODE B — no zone check, punch in from anywhere
 
      const attendance = await attendancemodel.create({
  userId: user._id,
  organizationId: user.organizationId,

  mode: user.attendanceMode,

  date: today,

  punchInTime: new Date(),

  punchInCoords: {
    lat,
    lng,
  },

  breadcrumb: [
    {
      lat,
      lng,
      recordedAt: new Date(),
    },
  ],

  zoneName: assignedZoneId,

  status: "punched_in"
});
 
      await auditlogs.create({
  orgId: user.organizationId,

  actorId: user._id,
  actorName: user.name,
  actorRole: user.role,

  targetUserId: user._id,

  category: "attendance",
  actionType: "PUNCH_IN",

  meta: {
    lat,
    lng,
    mode: user.attendanceMode
  },

  afterValue: { lat, lng },

  outcome: "success",
});
 
      return res.status(201).json({
        message: 'Punch in successful',
        attendance,
      });
    }
 
    // ==========================================================================
    // PUNCH OUT
    // ==========================================================================
 
    if (action === 'out') {
 
      const attendance = await attendancemodel.findOne({
        userId: user._id,
        date:   today,
        status: 'punched_in',
      });
 
      if (!attendance) {
        return res.status(404).json({ message: 'No active punch-in found for today' });
      }
 
      // MODE A — must be inside a zone to punch out too
      if (user.attendanceMode === 'A') {
        const activeZones = user.assignedZones;
        // const activeZones = user.assignedZones.filter((z) => z.isActive);
        const matchedZone = activeZones.find((z) => isInsideZone(lat, lng, z));
 
        if (!matchedZone) {
          const closestZone = activeZones.reduce((closest, zone) => {
            return distanceFromZone(lat, lng, zone) < distanceFromZone(lat, lng, closest)
              ? zone : closest;
          });
          const dist = distanceFromZone(lat, lng, closestZone);
 
          return res.status(403).json({
            message: `You must be inside your zone to punch out. You are ${dist} m away.`,
            distanceFromZone: dist,
            zoneName: closestZone.name,
          });
        }
      }
 
      // MODE B — no zone check, punch out from anywhere
 
      const outTime  = new Date();
if (!attendance.punchInTime) {
  return res.status(400).json({
    message: "Punch in time missing"
  });
}

const duration = Math.round(
  (new Date(outTime) - new Date(attendance.punchInTime)) / 60000
);
attendance.breadcrumb.push({
  lat,
  lng,
  recordedAt: outTime
});

attendance.punchOutTime = outTime;

attendance.punchOutCoords = {
  lat,
  lng
};

attendance.duration = duration;

attendance.status = "punched_out";
      await attendance.save();
 
      await auditlogs.create({
  orgId: user.organizationId,

  actorId: user._id,
  actorName: user.name,
  actorRole: user.role,

  targetUserId: user._id,

  category: "attendance",
  actionType: "PUNCH_OUT",

  meta: {
    lat,
    lng,
    duration,
    mode: user.attendanceMode
  },

  afterValue: { lat, lng, duration },

  outcome: "success",
});


      return res.status(200).json({
        message: 'Punch out successful',
        attendance,
      });
    }
 
    return res.status(400).json({ message: 'Invalid action' });
 
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const getMyAttendance = async (req, res) => {
  try {

    const attendance = await attendancemodel.find({userId: req.params.id}).sort({ createdAt: -1 });
    res.status(200).json(attendance);

  } catch (err) {
    res.status(500).json({message: err.message});
  }
};
const getMyAuditLogs = async (req, res) => {
  try {

    const logs = await auditlogs.find({
      targetUserId: req.params.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(logs);

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });
  }
};

// ======================================
// ATTENDANCE SUMMARY
// ======================================

const getAttendanceSummary = async (
  req,
  res
) => {
  try {

    const attendance =
      await attendancemodel.find({
        userId: req.params.id,
      });

    const totalDays =
      attendance.length;

    const presentDays =
      attendance.filter(
        (a) =>
          a.status ===
          "punched_out"
      ).length;

    const totalMinutes =
      attendance.reduce(
        (sum, item) =>
          sum + item.duration,
        0
      );

    res.status(200).json({totalDays, presentDays, totalMinutes});

  } catch (err) {
    res.status(500).json({message: err.message});
  }
};

const getLocationHistory = async (req, res) => {
  try {
    const attendance =
      await attendancemodel.find({userId: req.params.id});
    const locations = attendance.map((a) => ({
  date: a.date,
  breadcrumb: a.breadcrumb,
}));
    res.status(200).json(locations);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
const getShiftReminder = async (
  req,
  res
) => {
  try {

    const user = await usermodel.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message:
        "Your shift starts at " +
        user.shiftStart,
    });

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });
  }
};



// ======================================
// PUNCH OUT REMINDER
// ======================================

const getPunchOutReminder = async (
  req,
  res
) => {
  try {

    const user = await usermodel.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message:
        "Remember to punch out before " +
        user.shiftEnd,
    });

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });
  }
};
  const updateLiveLocation = async (req, res) => {
    try {
      const { userId, lat, lng } = req.body;

      if (!userId || lat == null || lng == null) {
        return res.status(400).json({
          message: "userId, lat and lng are required",
        });
      }

      // Find active attendance
      const attendance = await attendancemodel.findOne({
        userId,
        status: "punched_in",
        mode: "B",
      });

      if (!attendance) {
        return res.status(404).json({
          message: "No active Mode B attendance found",
        });
      }

      // Push breadcrumb
      attendance.breadcrumb.push({
        lat,
        lng,
        recordedAt: new Date(),
      });

      // Store latest location
      attendance.currentLocation = {
        lat,
        lng,
        updatedAt: new Date(),
      };

      await attendance.save();

      return res.status(200).json({
        message: "Location updated successfully",
        currentLocation: attendance.currentLocation,
      });

    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  };
  const getActiveSession = async (req, res) => {
    try {

      const attendance =
        await attendancemodel
          .findOne({
            userId: req.params.userId,
            status: "punched_in",
          })
          .populate(
            "userId",
            "name email attendanceMode"
          );

      res.status(200).json({
        active: !!attendance,
        attendance,
      });

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });
    }
  };

module.exports = {getMyProfile, punchAttendance, getMyAttendance,getMyAuditLogs, getAttendanceSummary, getLocationHistory, getShiftReminder, getPunchOutReminder,updateLiveLocation, getActiveSession};