let bcrypt = require("bcryptjs")
let jwt = require("jsonwebtoken")
const breadcrumb = require("../models/breadcrumb")
const tracking = require("../models/livetracking")
const disconnect = require("../models/trackingdisconnect")
const usermodel = require("../models/user")
const attendancemodel = require("../models/attendance")
const zonemodel = require("../models/geofenced")
const auditlogs = require("../models/auditlogs")
const geofenced = require("../models/geofenced")
const report = require("../models/report")
const organization = require("../models/organization")
const SubscriptionPlan = require("../models/SubscriptionPlan");
const Subscription = require("../models/Subscription");
const BillingRecord = require("../models/BillingRecord");
const { v4: uuidv4 } = require("uuid");
const PDFDocument = require("pdfkit");
const { Parser } = require("json2csv");

let checkAdmin = async (req, res) => {
    try {
        let exist = await usermodel.findOne({role: "admin"})
        if (exist) {
            return res.status(200).json({exists: true});
        }
        res.status(200).json({exists: false})
    }catch (err) {
        console.log(err);
        res.status(500).json({message: err.message});
    }
}

let adminReg = async(req,res)=>{
    try {
        let exist = await usermodel.findOne({role:"admin"})
        if(exist){
            return res.status(400).json({message:"Admin already exists"})
        }
        let pwdhash = await bcrypt.hash(req.body.password,10)
         const zones = await zonemodel.find({
  _id: { $in: req.body.assignedZones }
});
        let admin = new usermodel({...req.body, password:pwdhash, role:"admin", assignedZones: zones.map((z) => z._id), gpsEnabled: true, locationConsent: false})
        await admin.save()
        res.status(201).json({message:"Admin added successfully"})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Error adding admin"})
    }
}
const registerUser = async (req, res) => {
  try {
    if (req.user.role === "member") {return res.status(403).json({message: "Members are not allowed to create users"});
    }
    // editor can create member only
    if (req.user.role === "editor") {
      if ( req.body.role === "admin" || req.body.role === "editor") 
        {return res.status(400).json({message: "Editors can create only members"})}
    }
    let exist = await usermodel.findOne({email: req.body.email});
    if (exist) {
      return res.status(400).json({message: "Account already exists"});
    }
    let pwdhash = await bcrypt.hash(req.body.password, 10);
    const zones = await zonemodel.find({
  _id: { $in: req.body.assignedZones }
});

let newUser = new usermodel({ ...req.body, password: pwdhash, assignedZones: zones.map((z) => z._id), gpsEnabled: true, locationConsent: false});
console.log(newUser)
await newUser.save();
    let userToken = jwt.sign({_id: newUser._id, role: newUser.role}, process.env.SECRET_KEY, {expiresIn: "1h"}
    );
    res.status(201).json({message: "User added successfully", token: userToken, user: newUser});
  } catch (err) {
    console.log(err);
    res.status(500).json({message: err.message});
  }
};

let login = async(req,res)=>{
    try {
        let user = await usermodel.findOne({ email:req.body.email})
        if(!user){
            return res.status(400).json({message:"User not found"})
        }
        let isMatch = await bcrypt.compare(req.body.password, user.password)
        if(!isMatch){
            return res.status(400).json({message:"Invalid credentials"})
        }
        res.status(200).json({token:jwt.sign({_id:user._id, role:user.role}, process.env.SECRET_KEY, {expiresIn:"1h"}), _id: user._id, name:user.name, role:user.role})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Error logging in"})
    }
}

//user-management
let getUsers = async (req, res) => {
    try {
        let users = await usermodel.find({role: { $in: ["editor", "member"] }}).populate("organizationId","name")
      .populate("assignedZones", "name");;
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}
let deleteUser = async (req, res) => {
    try {
        await usermodel.findByIdAndDelete(req.params.id)
        res.status(200).json({message: "User deleted"})
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}
let updateUser = async (req, res) => {
    try {
        let updateData = { name: req.body.name, email: req.body.email, role: req.body.role, attendanceMode: req.body.attendanceMode, gpsEnabled: req.body.gpsEnabled, isActive: req.body.isActive}
        await usermodel.findByIdAndUpdate(req.params.id, updateData)
        res.status(200).json({message: "User updated"})
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

//GEO_FENCED
const createZone = async (req, res) => {
  try {
    console.log(req.user);
    const {
      name,
      lat,
      lng,
      radius,
      organizationId
    } = req.body;

    // VALIDATION

    if (!name) {
      return res.status(400).json({
        message: "Zone name required"
      });
    }

    if (!organizationId) {
      return res.status(400).json({
        message: "Organization required"
      });
    }

    if (radius < 50 || radius > 5000) {
      return res.status(400).json({
        message:
          "Radius must be between 50 and 5000 meters"
      });
    }

    // CREATE ZONE

    const zone = await zonemodel.create({

      name,

      organizationId,

      lat,

      lng,

      radius,

      createdBy: req.user._id,

      isActive: true,
    });

    res.status(201).json({

      message:
        "Zone created successfully",

      zone,
    });

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }
};


function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function writeAudit(data) {
  await auditlogs.create(data);
}

const getAllAttendance = async (req, res) => {
  try {
     const filter = {
      orgId: req.user.orgId,
      ...(req.query.mode && { mode: req.query.mode }),
      ...(req.query.status && { status: req.query.status }),
      ...(req.query.date && { date: req.query.date }),
      ...(req.query.userId && { userId: req.query.userId }),
    };
    const records = await attendancemodel.find(filter)
      .populate("userId", "name email role attendanceMode")
      .populate("zoneName", "name center radius")
      .sort({ createdAt: -1 });

    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching attendance." });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const logs =await auditlogs.find().sort({createdAt: -1});
    res.status(200).json(logs);
  } catch (error) {
    console.log(error);
    res.status(500).json({message:"Error fetching audit logs"});
  }
};

const createOrganization = async (req, res) => {
  try {
    const org = await organization.create(req.body);
    res.status(201).json(org);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const getOrganizations = async (req, res) => {
  try {
    const orgs = await organization.find();
    res.json(orgs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateOrganization = async (req, res) => {
  try {
    const org = await organization.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(org);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const deleteOrganization = async (req, res) => {
  try {
    await organization.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// GET /api/plans
const getAllPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find().sort({ pricePerMonth: 1 });
    res.json({ success: true, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
 
// GET /api/plans/:id
const getPlanById = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
    res.json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
 
// POST /api/plans
const createPlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.create(req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
 
// PUT /api/plans/:id
const updatePlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",  // ← change this line
      runValidators: true,
    });
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
    res.json({ success: true, data: plan });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
 
// DELETE /api/plans/:id
const deletePlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
    res.json({ success: true, message: "Plan deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate("organization", "name attendanceMode")
      .populate("plan", "name pricePerMonth maxUsers");
    res.json({ success: true, data: subscriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
 
// GET /api/subscriptions/:id
const getSubscriptionById = async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id)
      .populate("organization", "name attendanceMode")
      .populate("plan", "name pricePerMonth maxUsers description");
    if (!sub) return res.status(404).json({ success: false, message: "Subscription not found" });
    res.json({ success: true, data: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
 
// GET /api/subscriptions/org/:orgId
const getSubscriptionByOrg = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ organization: req.params.orgId })
      .populate("organization", "name attendanceMode")
      .populate("plan", "name pricePerMonth maxUsers description");
    if (!sub) return res.status(404).json({ success: false, message: "No subscription found for this organization" });
    res.json({ success: true, data: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
 
// POST /api/subscriptions
const createSubscription = async (req, res) => {
  try {
    const { organization, plan, status, startDate, endDate, autoRenew } = req.body;
 
    const existing = await Subscription.findOne({ organization });
    if (existing) return res.status(400).json({ success: false, message: "Organization already has a subscription" });
 
    const sub = await Subscription.create({ organization, plan, status, startDate, endDate, autoRenew });
    await sub.populate(["organization", "plan"]);
    res.status(201).json({ success: true, data: sub });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
 
// PUT /api/subscriptions/:id
const updateSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",  
      runValidators: true,
    })
      .populate("organization", "name attendanceMode")
      .populate("plan", "name pricePerMonth maxUsers");
    if (!sub) return res.status(404).json({ success: false, message: "Subscription not found" });
    res.json({ success: true, data: sub });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
 
// DELETE /api/subscriptions/:id
const deleteSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findByIdAndDelete(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: "Subscription not found" });
    res.json({ success: true, message: "Subscription deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/billing
const getAllBillingRecords = async (req, res) => {
  try {
    const records = await BillingRecord.find()
      .populate({
        path: "subscription",
        populate: [
          { path: "organization", select: "name" },
          { path: "plan", select: "name pricePerMonth" },
        ],
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
 
// GET /api/billing/:id
const getBillingById = async (req, res) => {
  try {
    const record = await BillingRecord.findById(req.params.id).populate({
      path: "subscription",
      populate: [
        { path: "organization", select: "name" },
        { path: "plan", select: "name pricePerMonth" },
      ],
    });
    if (!record) return res.status(404).json({ success: false, message: "Billing record not found" });
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
 
// GET /api/billing/subscription/:subId
const getBillingBySubscription = async (req, res) => {
  try {
    const records = await BillingRecord.find({ subscription: req.params.subId }).sort({ createdAt: -1 });
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
 
// POST /api/billing
const createBillingRecord = async (req, res) => {
  try {
    const { subscription, amount, paymentStatus, paymentDate } = req.body;
    const invoiceId = `INV-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`;
    const record = await BillingRecord.create({ subscription, amount, paymentStatus, invoiceId, paymentDate });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
 
// PUT /api/billing/:id
const updateBillingRecord = async (req, res) => {
  try {
    const { invoiceId, ...rest } = req.body; // prevent invoiceId update
    const record = await BillingRecord.findByIdAndUpdate(req.params.id, rest, {
      returnDocument: "after",  // ← change this line
      runValidators: true,    
    });
    if (!record) return res.status(404).json({ success: false, message: "Billing record not found" });
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
 
// DELETE /api/billing/:id
const deleteBillingRecord = async (req, res) => {
  try {
    const record = await BillingRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Billing record not found" });
    res.json({ success: true, message: "Billing record deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


const getzones = async (req, res) => {
  try {
    const zones = await zonemodel
.find()
.populate("organizationId");
    res.json(zones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
const updateAttendance  = async (req, res) => {
  try {
    const { id } = req.params;

    const allowedFields = [
      "status",
      "mode",
      "punchInTime",
      "punchOutTime",
      "date",
      "distanceFromZone",
      "totalDistance",
      "duration",
      "failedAttempt",
      "failedReason",
      "locationOffAt",
      "locationRestoredAt",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updated = await attendancemodel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    res.json({
      message: "Attendance updated successfully",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

const exportAttendancePdf = async(req, res)=>{
   try {
    const record = await attendancemodel.findById(req.params.id)
      .populate("userId", "name email")
      .populate("zoneName");

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument();

    // ✅ headers BEFORE piping
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=attendance_${record._id}.pdf`
    );

    // ✅ pipe FIRST
    doc.pipe(res);

    // ❗ ONLY WRITE TO DOC, NOT res
    doc.fontSize(18).text("Attendance Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Name: ${record.userId?.name || "-"}`);
    doc.text(`Email: ${record.userId?.email || "-"}`);
    doc.text(`Date: ${record.date}`);
    doc.text(`Status: ${record.status}`);
    doc.text(`Mode: ${record.mode}`);
    doc.text(`Punch In: ${record.punchInTime}`);
    doc.text(`Punch Out: ${record.punchOutTime}`);
    doc.text(`Zone: ${record.zoneName?.name || "-"}`);
    doc.text(`Distance: ${record.totalDistance || 0} m`);
    doc.text(`Duration: ${record.duration || 0} min`);

    // ✅ END ONLY ONCE
    doc.end();

  } catch (err) {
    console.log(err);

    // ❗ IMPORTANT: do NOT send response if headers already sent
    if (!res.headersSent) {
      res.status(500).json({ message: err.message });
    }
  }
}
 const exportAttendanceCsv = async(req, res)=>{
  try {
    const record = await attendancemodel.findById(req.params.id)
      .populate("userId", "name email")
      .populate("zoneName");

    if (!record) {
      return res.status(404).json({ message: "Not found" });
    }

    const formatted = [
      {
        Name: record.userId?.name || "-",
        Email: record.userId?.email || "-",
        Date: record.date,
        Status: record.status,
        Mode: record.mode,
        PunchIn: record.punchInTime,
        PunchOut: record.punchOutTime,
        Zone: record.zoneName?.name || "-",
        Distance: record.totalDistance || 0,
        Duration: record.duration || 0,
      },
    ];

    const { Parser } = require("json2csv");
    const parser = new Parser();
    const csv = parser.parse(formatted);

    res.header("Content-Type", "text/csv");
    res.attachment("attendance.csv");
    res.send(csv);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
 }
const getLiveEmployees = async (req, res) => {
  try {

    const employees =
  await attendancemodel
    .find({

      organizationId:
        req.params.organizationId,

      status:
        "punched_in",
    })

    .populate(
      "userId",
      "name email role attendanceMode"
    )

    .select(
      "userId currentLocation punchInCoords breadcrumb mode status"
    );

    res.status(200).json({
      count: employees.length,
      employees,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};

// get Employee Track history

const getEmployeeTrack = async (req, res) => {
  try {

    const attendance =
      await attendancemodel
        .findById(req.params.attendanceId)
        .populate(
          "userId",
          "name email attendanceMode"
        );

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance not found",
      });
    }

    res.status(200).json({
      employee: attendance.userId,
      breadcrumb: attendance.breadcrumb,
    });

  } catch (error) {

    res.status(500).json({
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

module.exports = {adminReg, registerUser, login, checkAdmin, getUsers, deleteUser, updateUser, createZone, getAllAttendance, getAuditLogs, createOrganization, getOrganizations, updateOrganization, deleteOrganization, getzones, updateAttendance, exportAttendancePdf, exportAttendanceCsv, getAllSubscriptions, getSubscriptionById, getSubscriptionByOrg, createSubscription, updateSubscription, deleteSubscription, getAllBillingRecords, getBillingById, getBillingBySubscription, createBillingRecord, updateBillingRecord, deleteBillingRecord, getAllPlans, getPlanById, createPlan, updatePlan, deletePlan, getActiveSession, getEmployeeTrack, getLiveEmployees}