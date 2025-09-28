const cron = require("node-cron");
const { ConnectionRequest, User } = require("../models");
const SendEmails = require("./sendEmail");

// this job will run at 8 am in the morning everyday
cron.schedule("0 8 * * *", async () => {
  // send email to all people who got request yesterday
  try {
    const today = new Date();
    const yesterday = new Date(today);
    // yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = yesterday.setHours(0, 0, 0, 0); // Start of yesterday

    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999); // End of yesterday

    const Requests = await ConnectionRequest.find({
      createdAt: {
        $gte: startOfYesterday,
        $lte: endOfYesterday,
      },
      status: "interested", // Only interested requests
    }).populate("fromUser toUser");
    // get unique emails
    const lateRequestsEmails = [
      ...new Set(Requests.map((request) => request.toUser.email)),
    ];
    console.log(lateRequestsEmails);

    for (const email of lateRequestsEmails) {
      console.log(email);
      await SendEmails.run(
        "Last day connection request",
        "You have a connection request from " + email
      );
      console.log(`Email sent to ${email}`);
    }
    // console.log("Cron job executed", new Date().toISOString());
  } catch (error) {
    console.log("Cron job error", error);
  }
});

// module.exports = { cronJobs };
