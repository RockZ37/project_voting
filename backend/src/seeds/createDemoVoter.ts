import bcrypt from "bcryptjs";
import { closeDb, query } from "../db";
import { generateId } from "../utils/id";

async function createDemoVoter() {
  const email = process.env.DEV_VOTER_EMAIL || "voter@civicvote.local";
  const password = process.env.DEV_VOTER_PASSWORD || "voterpass";
  const indexNumber = process.env.DEV_VOTER_INDEX || "0323080083";
  const name = process.env.DEV_VOTER_NAME || "Demo Voter";
  const course = process.env.DEV_VOTER_COURSE || "Computer Science";
  const role = "voter";

  const hash = await bcrypt.hash(password, 10);

  try {
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [email]);
    let userId = existingUser.rows[0]?.id as string | undefined;

    if (!userId) {
      userId = generateId();
      await query(
        "INSERT INTO users (id, email, password_hash, role, status) VALUES ($1, $2, $3, $4, 'active')",
        [userId, email, hash, role]
      );
    }

    const existingStudent = await query("SELECT id FROM student_identities WHERE index_number = $1", [indexNumber]);
    let studentId = existingStudent.rows[0]?.id as string | undefined;

    if (!studentId) {
      studentId = generateId();
      await query(
        `INSERT INTO student_identities (
          id,
          index_number,
          name,
          course,
          profile_photo_url,
          id_card_front_url,
          id_card_back_url,
          issue_date,
          valid_until,
          status
        ) VALUES ($1, $2, $3, $4, NULL, NULL, NULL, DATE('now'), DATE('now', '+1 year'), 'active')`,
        [studentId, indexNumber, name, course]
      );
    }

    const existingVoter = await query("SELECT id FROM voters WHERE user_id = $1 OR email = $2", [userId, email]);
    if ((existingVoter.rowCount ?? 0) === 0) {
      const voterId = generateId();
      await query(
        `INSERT INTO voters (
          id,
          user_id,
          student_identity_id,
          name,
          email,
          registration_date,
          status,
          photo_url,
          department
        ) VALUES ($1, $2, $3, $4, $5, DATE('now'), 'active', NULL, $6)`,
        [voterId, userId, studentId, name, email, course]
      );
    }

    console.log(`Demo voter ready: ${email}`);
  } finally {
    await closeDb();
  }
}

createDemoVoter().catch((err) => {
  console.error(err);
  process.exit(1);
});
