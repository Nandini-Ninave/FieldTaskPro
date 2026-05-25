const attendancemodel = require("../models/attendance");
const usermodel = require("../models/user");

let getUsers = async (req, res) => {
    try {
        let users = await usermodel.find({role: { $in: ["member"] }}).populate("organizationId","name")
      .populate("assignedZones", "name");;
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}
const getAllAttendance = async (req, res) => {
  try {
    // const { mode, status, date, userId } = req.query;
     const filter = {
      orgId: req.user.orgId,
      ...(req.query.mode && { mode: req.query.mode }),
      ...(req.query.status && { status: req.query.status }),
      ...(req.query.date && { date: req.query.date }),
      ...(req.query.userId && { userId: req.query.userId }),
    };
    const records = await attendancemodel.find(filter) .populate({
    path: "userId",
    match: { role: { $in: ["member", "editor"] }},
    select: "name email role attendanceMode"
  })
      .populate("zoneName", "name center radius")
      .sort({ createdAt: -1 });

    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching attendance." });
  }
};
module.exports = {getUsers, getAllAttendance}