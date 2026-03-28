const mongoose = require('mongoose');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const ExcelJS = require('exceljs');
const fs = require('fs');

const userModel = require('./schemas/users');
const roleModel = require('./schemas/roles');

// ================= MAILTRAP =================
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    secure: false,
    auth: {
        user: "41d9298cd57d96",
        pass: "6810bed626f16b",
    },
});

// ================= HELPER: FIX EXCEL VALUE =================
function getCellValue(cell) {
    let value = cell.value;

    if (!value) return '';

    if (typeof value === 'object') {
        return value.text || value.result || value.hyperlink || '';
    }

    return String(value);
}

// ================= READ EXCEL =================
async function readUsersFromExcel(filePath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);

    const users = [];

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
            let username = getCellValue(row.getCell(1)).trim();
            let email = getCellValue(row.getCell(2)).trim();

            if (rowNumber <= 3) {
                console.log(`Row ${rowNumber}: username="${username}", email="${email}"`);
            }

            if (username && email && email.includes('@')) {
                users.push({ username, email });
            }
        }
    });

    return users;
}

// ================= RANDOM PASSWORD =================
function generateRandomPassword(length = 16) {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
}

// ================= SEND MAIL =================
async function sendPasswordEmail(email, username, password) {
    try {
        await transporter.sendMail({
            from: 'admin@nnptud-c6.com',
            to: email,
            subject: 'Your Account Credentials',
            html: `
                <h2>Welcome to NNPTUD-C6</h2>
                <p>Hello <b>${username}</b></p>
                <p>Your password:</p>
                <h3>${password}</h3>
                <p>Please change after login.</p>
            `
        });

        console.log(`📧 Sent to ${email}`);
        return true;
    } catch (err) {
        console.error(`❌ Mail fail ${email}:`, err.message);
        return false;
    }
}

// ================= MAIN =================
async function importUsers(filePath) {
    try {
        await mongoose.connect('mongodb://localhost:27017/NNPTUD-C6');
        console.log('✓ Connected MongoDB');

        const users = await readUsersFromExcel(filePath);
        console.log(`✓ Loaded ${users.length} users`);

        const role = await roleModel.findOne({ name: 'user' });
        if (!role) {
            console.log('❌ Role user not found');
            return;
        }

        let created = 0;
        let updated = 0;
        let failed = 0;

        const logs = [];

        for (const u of users) {
            try {
                let existing = await userModel.findOne({
                    $or: [{ username: u.username }, { email: u.email }]
                });

                const password = generateRandomPassword(16);

                if (existing) {
                    // ===== UPDATE =====
                    existing.password = password;
                    await existing.save();

                    console.log(`🔄 Updated: ${u.username}`);

                    await sendPasswordEmail(u.email, u.username, password);

                    updated++;
                } else {
                    // ===== CREATE =====
                    const newUser = new userModel({
                        username: u.username,
                        email: u.email,
                        password: password,
                        role: role._id,
                        status: false,
                        fullName: '',
                        avatarUrl: 'https://i.sstatic.net/l60Hf.png'
                    });

                    await newUser.save();

                    console.log(`✅ Created: ${u.username}`);

                    await sendPasswordEmail(u.email, u.username, password);

                    created++;
                }

                logs.push({
                    username: u.username,
                    email: u.email,
                    password,
                    time: new Date()
                });

            } catch (err) {
                console.error(`❌ Error ${u.username}:`, err.message);
                failed++;
            }

            await new Promise(r => setTimeout(r, 7000));
        }

        // ================= SUMMARY =================
        console.log('\n==============================');
        console.log('IMPORT RESULT');
        console.log('==============================');
        console.log(`✅ Created: ${created}`);
        console.log(`🔄 Updated: ${updated}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📊 Total: ${users.length}`);
        console.log('==============================\n');

        fs.writeFileSync('password_log.json', JSON.stringify(logs, null, 2));
        console.log('📁 Saved password_log.json');

        await mongoose.disconnect();
        console.log('✓ Disconnected');

    } catch (err) {
        console.error('❌ Fatal:', err.message);
    }
}

// ================= RUN =================
const file = process.argv[2];

if (!file) {
    console.log('Usage: node importUsers.js <file.xlsx>');
    process.exit(1);
}

importUsers(file);