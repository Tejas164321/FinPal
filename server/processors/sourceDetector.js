function detectSource(fileName, content = "") {
  const name = fileName.toLowerCase();
  const contentLower = content.toLowerCase();

  // Google Pay detection
  if (
    name.includes("gpay") ||
    name.includes("google pay") ||
    name.includes("googlepay") ||
    contentLower.includes("google pay") ||
    contentLower.includes("gpay")
  ) {
    return "GPay";
  }

  // PhonePe detection
  if (
    name.includes("phonepe") ||
    name.includes("phone pe") ||
    name.includes("phone_pe") ||
    contentLower.includes("phonepe") ||
    contentLower.includes("phone pe")
  ) {
    return "PhonePe";
  }

  // Paytm detection
  if (
    name.includes("paytm") ||
    contentLower.includes("paytm") ||
    contentLower.includes("one97")
  ) {
    return "Paytm";
  }

  // Bank statement detection
  if (
    name.includes("bank") ||
    name.includes("statement") ||
    name.includes("account") ||
    contentLower.includes("account statement") ||
    contentLower.includes("bank statement") ||
    contentLower.includes("current account") ||
    contentLower.includes("savings account")
  ) {
    return "Bank";
  }

  // UPI generic detection
  if (
    name.includes("upi") ||
    name.includes("transaction") ||
    contentLower.includes("upi") ||
    contentLower.includes("unified payments")
  ) {
    return "UPI";
  }

  return "Unknown";
}

module.exports = { detectSource };
