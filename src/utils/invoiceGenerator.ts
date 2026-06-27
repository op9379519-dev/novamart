import { jsPDF } from "jspdf";
import { Order } from "../types";

export const generatePDFInvoice = (order: Order, customerName: string) => {
  // Create instance of jsPDF (A4 layout in millimeters)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // Theme Coloring Palette
  const primaryColor = [220, 38, 38]; // Modern Red Accent
  const secondaryColor = [30, 41, 59]; // Slate Navy
  const neutralDark = [15, 23, 42]; // Slate 900
  const neutralMuted = [100, 116, 139]; // Slate 500
  const lightGrey = [241, 245, 249]; // Slate 100

  // Robust field mapping to support multiple address key schemas
  const deliveryStreet = (order.shippingAddress as any).details || order.shippingAddress.street || "Verified Customer Address Line";
  const deliveryZip = (order.shippingAddress as any).pincode || order.shippingAddress.zipCode || "N/A";
  const recipientName = order.shippingAddress.name || order.buyerName || customerName || "Valued Customer";

  // --- 1. Branding Header ---
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("NOVAMART ENTERPRISE", 14, 22);

  doc.setFontSize(9);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(neutralMuted[0], neutralMuted[1], neutralMuted[2]);
  doc.text("Fastest Marketplace and Premium Quality Assurance Network", 14, 27);
  doc.text("Support center: assistance@novamart.com | Contact: +91 91122 33445", 14, 31);
  doc.text("Registered Trade GSTIN No: 92ABCCN0621F1ZX", 14, 35);

  // --- 2. Invoice Meta Segment (Right Aligned) ---
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text("SECURE TAX BILL INVOICE", 125, 22);

  doc.setFontSize(9);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
  doc.text(`Bill Ref: #${order.id}`, 125, 28);
  doc.text(`Settlement: Paid via ${order.paymentMethod.toUpperCase()}`, 125, 33);
  doc.text(`Receipt Date: ${order.date}`, 125, 38);

  // Divider Line
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.4);
  doc.line(14, 43, 196, 43);

  // --- 3. Billing & Dispatch Target Info Block ---
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text("DELIVERY CONSIGNEE / BILL TO:", 14, 51);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
  doc.text(recipientName, 14, 56);
  doc.text(deliveryStreet, 14, 61);
  doc.text(`${order.shippingAddress.city || "Metropolis"}, ${order.shippingAddress.state || "State"} - ${deliveryZip}`, 14, 66);
  doc.text(`Receiver Phone: ${order.shippingAddress.phone || "N/A"}`, 14, 71);

  // Courier details (Right side block)
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text("LOGISTICS LOG:", 125, 51);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
  doc.text("Expedited Direct Air-Cargo Logistics", 125, 56);
  doc.text("Insurance Protection: Fully Covered", 125, 61);
  doc.text(`Tracking ID: HND-${order.id}-TRANSIT`, 125, 66);

  // Divider line before Table
  doc.line(14, 76, 196, 76);

  // --- 4. Ordered Items Table Header ---
  doc.setFillColor(lightGrey[0], lightGrey[1], lightGrey[2]);
  doc.rect(14, 82, 182, 8, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text("Item / Merchandise Description", 18, 87.5);
  doc.text("Unit Price (INR)", 115, 87.5);
  doc.text("Qty", 152, 87.5);
  doc.text("Net Total", 173, 87.5);

  // --- 5. Ordered Items Rows ---
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);

  let currentY = 96;

  order.items.forEach((item, idx) => {
    // Truncate name if too long for layout width limits
    let finalTitle = item.productName;
    if (finalTitle.length > 55) {
      finalTitle = finalTitle.substring(0, 52) + "...";
    }

    doc.text(finalTitle, 18, currentY);
    doc.text(`Rs. ${item.price.toLocaleString("en-IN")}`, 115, currentY);
    doc.text(`${item.quantity}`, 154, currentY);
    
    const rowCost = item.price * item.quantity;
    doc.text(`Rs. ${rowCost.toLocaleString("en-IN")}`, 173, currentY);

    // Draw bottom row line helper
    doc.setDrawColor(241, 245, 249);
    doc.line(14, currentY + 4, 196, currentY + 4);
    
    currentY += 9;
  });

  currentY += 1;
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.line(14, currentY, 196, currentY);
  currentY += 6;

  // --- 6. Pricing Summary (Calculations alignment block) ---
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text("Cart Subtotal:", 125, currentY);
  doc.text(`Rs. ${order.subtotal.toLocaleString("en-IN")}`, 170, currentY);
  currentY += 6;

  if (order.discount > 0) {
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(22, 163, 74); // Success Emerald Green
    doc.text("Special Discount Campaign:", 125, currentY);
    doc.text(`-Rs. ${order.discount.toLocaleString("en-IN")}`, 170, currentY);
    currentY += 6;
    doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
    doc.setFont("Helvetica", "normal");
  }

  doc.text("Priority Courier Charge:", 125, currentY);
  doc.text("Rs. 45.00", 170, currentY);
  currentY += 8;

  // Final gross row
  doc.setDrawColor(148, 163, 184); // Slate 400
  doc.line(125, currentY - 3, 196, currentY - 3);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("GROSS TOTAL SETTLED:", 125, currentY);
  
  // Clean offset calculations
  doc.text(`Rs. ${order.total.toLocaleString("en-IN")}`, 170, currentY);

  // --- 7. Legal Disclaimer & Footer ---
  currentY += 24;
  if (currentY > 275) {
    doc.addPage();
    currentY = 25;
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(14, currentY, 196, currentY);
  currentY += 5;

  doc.setFont("Helvetica", "oblique");
  doc.setFontSize(7.5);
  doc.setTextColor(neutralMuted[0], neutralMuted[1], neutralMuted[2]);
  doc.text("Terms & Conditions of Service:", 14, currentY);
  doc.text("1. This is an official computer-compiled transaction statement. No manual ink-stamp signatures are registered.", 14, currentY + 4);
  doc.text("2. Product warranties, quality certifications, and dispute handlings are managed securely via NovaMart Consumer Helpdesk.", 14, currentY + 8);
  doc.text("3. Paid transactions include local priority service charges. All tax summaries are computed by state and union standards.", 14, currentY + 12);
  
  doc.setFont("Helvetica", "bold");
  doc.text("Thank you for choosing NovaMart! We look forward to fulfilling your future shopping needs.", 14, currentY + 18);

  // Download locally
  doc.save(`Invoice_${order.id}.pdf`);
};
