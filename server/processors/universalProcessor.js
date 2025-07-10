const fs = require("fs");
const pdfParse = require("pdf-parse");
const csv = require("csv-parser");
const xlsx = require("xlsx");
const { PhonePeParser } = require("./phonePeParser");

/**
 * Clean Universal Transaction Processor
 * Simple, focused implementation
 */
class UniversalTransactionProcessor {
  constructor() {
    this.strategies = [new PhonePeParser()];
  }

  async processFile(filePath, fileName) {
    try {
      console.log(`🚀 Processing: ${fileName}`);

      // Extract raw data from file
      const rawData = await this.extractRawData(filePath, fileName);

      // Try each parser strategy
      for (const strategy of this.strategies) {
        console.log(`🔍 Trying: ${strategy.name}`);
        const result = await strategy.process(rawData, fileName);

        if (result.transactions && result.transactions.length > 0) {
          console.log(
            `✅ Success: ${result.transactions.length} transactions found`,
          );
          return result;
        }
      }

      console.log("❌ No transactions found");
      return { transactions: [], source: "Unknown", confidence: "None" };
    } catch (error) {
      console.error("❌ Processing error:", error);
      throw error;
    }
  }

  async extractRawData(filePath, fileName) {
    const ext = fileName.toLowerCase().split(".").pop();

    switch (ext) {
      case "pdf":
        return await this.extractFromPDF(filePath);
      case "csv":
        return await this.extractFromCSV(filePath);
      case "xlsx":
      case "xls":
        return await this.extractFromExcel(filePath);
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  }

  async extractFromPDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;

    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    return {
      type: "text",
      lines: lines,
      fullText: text,
    };
  }

  async extractFromCSV(filePath) {
    return new Promise((resolve, reject) => {
      const rows = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => rows.push(row))
        .on("end", () =>
          resolve({
            type: "structured",
            rows: rows,
            headers: rows.length > 0 ? Object.keys(rows[0]) : [],
          }),
        )
        .on("error", reject);
    });
  }

  async extractFromExcel(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    return {
      type: "structured",
      rows: jsonData,
      headers: jsonData.length > 0 ? Object.keys(jsonData[0]) : [],
    };
  }
}

module.exports = { UniversalTransactionProcessor };
