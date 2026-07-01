export class ReportNotFoundError extends Error {
  constructor(message = "Report not found") {
    super(message);
    this.name = "ReportNotFoundError";
  }
}
