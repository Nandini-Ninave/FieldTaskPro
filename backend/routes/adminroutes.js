const express=require("express")
const {auth, adminOrEditor} = require("../middleware/auth");
const router=express.Router()
const {login, registerUser, adminReg, checkAdmin, updateUser, deleteUser, getUsers, createZone,  getAllAttendance, getAuditLogs, createOrganization, getOrganizations, updateOrganization, deleteOrganization, createPlan, updatePlan, deletePlan, getzones, updateAttendance, exportAttendanceCsv, exportAttendancePdf, getAllPlans, getPlanById, getAllSubscriptions, getSubscriptionByOrg, getSubscriptionById, createSubscription, updateSubscription, deleteSubscription, deleteBillingRecord, updateBillingRecord, createBillingRecord, getBillingById, getBillingBySubscription, getAllBillingRecords, getActiveSession, getEmployeeTrack, getLiveEmployees}=require("../controllers/admincont");

router.get("/",(req,res)=> {
    res.send("backend running")
})
router.post("/adminreg",adminReg)
router.post("/userReg",auth, registerUser)
router.post("/login",login)
router.get("/check-admin", checkAdmin)
router.get("/users", getUsers)
router.delete( "/delete-user/:id", deleteUser)
router.put("/update-user/:id", updateUser)
router.post("/create-zone", auth, createZone);
router.get("/getzones", getzones)
router.get("/audit-logs", auth, adminOrEditor, getAuditLogs);

router.get("/all", auth, adminOrEditor, getAllAttendance);
router.put("/update/:id",updateAttendance)
router.get("/attendance/pdf/:id",exportAttendancePdf)
router.get("/attendance/csv/:id",exportAttendanceCsv)

router.get("/live/:organizationId",getLiveEmployees)
router.get( "/track/:attendanceId", getEmployeeTrack);
router.get("/active/:userId", getActiveSession);

router.post("/createOrganization", createOrganization);
router.get("/getOrganizations", getOrganizations);
router.put("/updateOrganization/:id",updateOrganization);
router.delete("/deleteOrganization/:id", deleteOrganization);

router.get("/getAllPlans", getAllPlans);
router.get("/getPlanById/:id", getPlanById);
router.post("/createPlan", createPlan);
router.put("/updatePlan/:id", updatePlan);
router.delete("/deletePlan/:id", deletePlan);

router.get("/getAllSubscriptions", getAllSubscriptions);
router.get("/getSubscriptionByOrg/org/:orgId", getSubscriptionByOrg);
router.get("/getSubscriptionById/:id", getSubscriptionById);
router.post("/createSubscription", createSubscription);
router.put("/updateSubscription/:id", updateSubscription);
router.delete("/deleteSubscription/:id", deleteSubscription);

router.get("/getAllBillingRecords", getAllBillingRecords);
router.get("/getBillingBySubscription/subscription/:subId", getBillingBySubscription);
router.get("/getBillingById/:id", getBillingById);
router.post("/createBillingRecord", createBillingRecord);
router.put("/updateBillingRecord/:id", updateBillingRecord);
router.delete("/deleteBillingRecord/:id", deleteBillingRecord);


module.exports=router