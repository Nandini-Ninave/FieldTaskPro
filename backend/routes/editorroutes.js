const express=require("express")
const {auth, adminOrEditor} = require("../middleware/auth");
const { registerUser, deleteUser, updateUser, updateAttendance, exportAttendancePdf, exportAttendanceCsv, getLiveEmployees, getEmployeeTrack, getActiveSession} = require("../controllers/admincont");
const { getUsers, getAllAttendance } = require("../controllers/editor");
const router=express.Router()

router.post("/userReg",auth, registerUser)
router.get("/users", getUsers)
router.delete( "/delete-user/:id", deleteUser)
router.put("/update-user/:id", updateUser)
router.get("/all", auth, adminOrEditor, getAllAttendance);
router.put("/update/:id",updateAttendance)
router.get("/attendance/pdf/:id",exportAttendancePdf)
router.get("/attendance/csv/:id",exportAttendanceCsv)
router.get("/live/:organizationId",getLiveEmployees)
router.get( "/track/:attendanceId", getEmployeeTrack);
router.get("/active/:userId", getActiveSession);

module.exports=router