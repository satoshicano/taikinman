import { google } from "googleapis";
import { loginAndScreenshot } from "./puppeteerClient";
import { sendResultToSlack } from "./slackClient";

// const message = process.env.MESSAGE;
const BUCKET = process.env.BUCKET;

const getAccessToken = (header: any) => {
  if (!header) {
    return null;
  }

  const match = header.match(/^Bearer\s+([^\s]+)$/);
  return match ? match[1] : null;
};

const authorized = async (req: any, res: any) => {
  await loginAndScreenshot(req, res);
  sendResultToSlack();
  res.send("success");
};

exports.echo = async (req: any, res: any) => {
  const accessToken = getAccessToken(req.get("Authorization"));
  console.log("accessTOken", accessToken);
  const oauth = new google.auth.OAuth2();
  oauth.setCredentials({ access_token: accessToken });

  const permission = "storage.buckets.get";
  const gcs = google.storage("v1");
  await gcs.buckets.testIamPermissions(
    { bucket: BUCKET, permissions: [permission], auth: oauth },
    {},
    async (err, response) => {
      if (err) {
        console.error(err);
      }
      if (
        response !== null &&
        response !== undefined &&
        response.data.permissions.includes(permission)
      ) {
        await authorized(req, res);
      } else {
        res.status(403).send("It is an invalid account.");
      }
    }
  );
};
