const express=require("express")
const {auth} = require("../middleware/auth");
const { punchAttendance, getMyAuditLogs, getMyProfile, getAttendanceSummary, getLocationHistory, getShiftReminder, getPunchOutReminder, getMyAttendance, getActiveSession, updateLiveLocation } = require("../controllers/membercont");
// const { getMyAttendance } = require("../controllers/admincont");
const router=express.Router()
router.post("/punch", punchAttendance);

router.get("/attendance/:id", getMyAttendance);

router.get("/auditLogs/:id", getMyAuditLogs);

router.get("/profile/:id", getMyProfile);

router.get("/attendanceSummary/:id", getAttendanceSummary);

router.get("/locationHistory/:id", getLocationHistory);

router.get("/shiftReminder/:id", getShiftReminder);

router.get("/punchOutReminder/:id", getPunchOutReminder);
router.post( "/attendance/location-ping", updateLiveLocation);
router.get("/attendance/active/:userId", getActiveSession);

module.exports=router