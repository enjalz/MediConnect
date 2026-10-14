const cron = require("node-cron");
const appointmentSchema = require("../schemas/appointmentModel");
const userSchema = require("../schemas/userModel");

// Berjalan setiap 30 menit: cari appointment "approved" yang jadwalnya
// dalam 24 jam ke depan, lalu kirim notifikasi reminder ke pasien.
const startReminderJob = () => {
  cron.schedule("*/30 * * * *", async () => {
    try {
      const now = new Date();
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const appointments = await appointmentSchema.find({
        status: "approved",
        reminderSent: false,
      });

      for (const appt of appointments) {
        const apptDate = new Date(appt.date);
        if (isNaN(apptDate) || apptDate < now || apptDate > in24h) continue;

        const patient = await userSchema.findById(appt.userId);
        if (patient) {
          patient.notification.push({
            type: "appointment-reminder",
            message: `Reminder: you have an appointment with Dr. ${appt.doctorInfo.fullName} on ${appt.date}`,
          });
          await patient.save();
        }

        appt.reminderSent = true;
        await appt.save();
      }
    } catch (err) {
      console.error("Reminder job error:", err.message);
    }
  });

  console.log("Reminder job started (every 30 minutes)");
};

module.exports = startReminderJob;