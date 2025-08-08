import path from 'path';
import { fileURLToPath } from 'url';
import ExcelJS from 'exceljs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKBOOK_PATH = path.join(__dirname, '../../bookings.xlsx');

class ReportService {
  async _loadWorkbook() {
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.readFile(WORKBOOK_PATH);
    } catch {
      // New workbook with a sheet
      const sheet = workbook.addWorksheet('Bookings');
      sheet.columns = [
        { header: 'Timestamp', key: 'timestamp', width: 24 },
        { header: 'Action', key: 'action', width: 14 },
        { header: 'Booking ID', key: 'booking_id', width: 18 },
        { header: 'Event ID', key: 'event_id', width: 16 },
        { header: 'Event Name', key: 'event_name', width: 32 },
        { header: 'User ID', key: 'user_id', width: 16 },
        { header: 'User Email', key: 'user_email', width: 28 },
        { header: 'User Name', key: 'user_name', width: 24 },
        { header: 'Phone', key: 'phone', width: 18 },
        { header: 'Status', key: 'status', width: 14 }
      ];
      await workbook.xlsx.writeFile(WORKBOOK_PATH);
    }
    return workbook;
  }

  async recordBooking({ booking, user, event }) {
    const workbook = await this._loadWorkbook();
    const sheet = workbook.getWorksheet('Bookings') || workbook.addWorksheet('Bookings');
    sheet.addRow({
      timestamp: new Date().toISOString(),
      action: 'BOOK',
      booking_id: booking.id,
      event_id: event?.id,
      event_name: event?.name,
      user_id: user?.id,
      user_email: user?.email,
      user_name: user?.name || '',
      phone: user?.phone || '',
      status: booking.status || 'active'
    });
    await workbook.xlsx.writeFile(WORKBOOK_PATH);
  }

  async recordCancellation({ bookingId, userId }) {
    const workbook = await this._loadWorkbook();
    const sheet = workbook.getWorksheet('Bookings') || workbook.addWorksheet('Bookings');
    sheet.addRow({
      timestamp: new Date().toISOString(),
      action: 'CANCEL',
      booking_id: bookingId,
      user_id: userId,
      status: 'cancelled'
    });
    await workbook.xlsx.writeFile(WORKBOOK_PATH);
  }

  async generateSummaries() {
    const workbook = await this._loadWorkbook();
    const sheet = workbook.getWorksheet('Bookings');
    if (!sheet) return WORKBOOK_PATH;
    const rows = sheet.getSheetValues().slice(2); // skip header
    const stats = { daily: new Map(), weekly: new Map() };
    for (const row of rows) {
      if (!row) continue;
      const ts = new Date(row[1]);
      const action = row[2];
      if (!ts || isNaN(ts.getTime())) continue;
      const dayKey = ts.toISOString().slice(0, 10);
      const weekKey = `${ts.getUTCFullYear()}-W${Math.ceil(((ts - new Date(Date.UTC(ts.getUTCFullYear(),0,1))) / 86400000 + new Date(Date.UTC(ts.getUTCFullYear(),0,1)).getUTCDay()+1)/7)}`;
      const day = stats.daily.get(dayKey) || { booked: 0, cancelled: 0 };
      const week = stats.weekly.get(weekKey) || { booked: 0, cancelled: 0 };
      if (action === 'BOOK') { day.booked++; week.booked++; }
      if (action === 'CANCEL') { day.cancelled++; week.cancelled++; }
      stats.daily.set(dayKey, day);
      stats.weekly.set(weekKey, week);
    }
    // Create/update summary sheets
    const dailySheet = workbook.getWorksheet('Daily Summary') || workbook.addWorksheet('Daily Summary');
    dailySheet.spliceRows(1, dailySheet.rowCount);
    dailySheet.addRow(['Date', 'Booked', 'Cancelled']);
    Array.from(stats.daily.entries()).sort(([a],[b]) => a.localeCompare(b)).forEach(([date, c]) => dailySheet.addRow([date, c.booked, c.cancelled]));

    const weeklySheet = workbook.getWorksheet('Weekly Summary') || workbook.addWorksheet('Weekly Summary');
    weeklySheet.spliceRows(1, weeklySheet.rowCount);
    weeklySheet.addRow(['Week', 'Booked', 'Cancelled']);
    Array.from(stats.weekly.entries()).sort(([a],[b]) => a.localeCompare(b)).forEach(([week, c]) => weeklySheet.addRow([week, c.booked, c.cancelled]));

    await workbook.xlsx.writeFile(WORKBOOK_PATH);
    return WORKBOOK_PATH;
  }
}

export default new ReportService();


