import { Router } from "express";
import { createInvoice, handleWebhook } from "../controllers/paymentController";
const router = Router();

router.post("/create-invoice", createInvoice);
router.post("/webhook", handleWebhook);

export default router;
