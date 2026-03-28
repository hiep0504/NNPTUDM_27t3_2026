const ExcelJS = require('exceljs');

async function createSampleUsersExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    // Add header row
    worksheet.columns = [
        { header: 'username', key: 'username', width: 15 },
        { header: 'email', key: 'email', width: 25 }
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF366092' } };

    // Add user data
    const users = [];
    for (let i = 1; i <= 99; i++) {
        users.push({
            username: `user${String(i).padStart(2, '0')}`,
            email: `user${String(i).padStart(2, '0')}@haha.com`
        });
    }

    worksheet.addRows(users);

    // Save file
    await workbook.xlsx.writeFile('./users_import.xlsx');
    console.log('✓ Sample Excel file created: users_import.xlsx');
}

createSampleUsersExcel().catch(err => console.error('Error:', err));
