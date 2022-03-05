const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const excelToJson = require('convert-excel-to-json');
const xlsx = require('xlsx');

const connection = require("./dbConnection");
const sheetModel = require('./models/sheetDataModel');
const app = express()

connection();
app.use(cors())
app.use(express.json())
app.use(bodyParser.json())

const dateObj = new Date().getTime().toString().substr(1, 6);
const fileNameFilter = dateObj + '_' + new Date().toLocaleDateString().toString() + '.xlsx';
const newStr = fileNameFilter.replace(new RegExp('/', 'g'), '-')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../assets/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname.split(".")[0] + newStr)
  }
})

const upload = multer({ storage: storage })

app.get('/getData', async (req, res) => {
  const sheetData = await sheetModel.find();
  res.json({ message: 'Sheet data get successfully', data: sheetData });
});

app.post('/imports', upload.single('upload'), async (req, res) => {
  const fileName = req.file && req.file.originalname.split(".")[0] + newStr;
  if (fileName) {
    const filesPath = path.resolve(__dirname, '../assets/' + fileName)

    const result = excelToJson({ sourceFile: filesPath });
    let sheetData = {};
    Object.keys(result)
      .forEach(function eachKey(key) {
        result[key].shift();
        sheetData = result[key];
      });

    const newArray = [...sheetData]
    const updatedArray = newArray.map((item) => {
      return {
        name: item.A,
        age: item.B,
        phoneno: item.C
      }
    });

    const resultData = await sheetModel.insertMany(updatedArray);
    return res.json({ messgae: "Data imported successfully", data: resultData })
  }
})

const exportExcel = (data, workSheetColumnNames, workSheetName, filePath) => {
  const workBook = xlsx.utils.book_new();
  const workSheetData = [
    workSheetColumnNames,
    ...data
  ];
  const workSheet = xlsx.utils.aoa_to_sheet(workSheetData);
  xlsx.utils.book_append_sheet(workBook, workSheet, workSheetName);
  xlsx.writeFile(workBook, path.resolve(filePath))
}

const exportUsersToExcel = (users, workSheetColumnNames, workSheetName, filePath) => {
  const data = users.map((user) => {
    return [user.name, parseInt(user.age), parseInt(user.phoneno)]
  });
  exportExcel(data, workSheetColumnNames, workSheetName, filePath);
}

app.post('/exports', upload.single('upload'), (req, res) => {
  const workSheetColumnNames = [
    "name",
    "age",
    "phoneno"
  ];

  const workSheetName = "Users";
  const filePath = path.resolve(__dirname, `../assets/exportSheet${newStr}`);
  exportUsersToExcel(req.body, workSheetColumnNames, workSheetName, filePath);
  res.send({ message: 'Sheet exported successfully' });
});

app.post('/delete-sheetdata', async (req, res) => {
  const { data } = req.body;
  for (let i = 0; i < data.length; i++) {
    const element = data[i];
    await sheetModel.deleteOne({ _id: element._id })
  }
  res.send({ message: 'Deleted successfully' })
})

const port = process.env.PORT || 8000
app.listen(port, () => {
  console.log(`server started on port ${port}: http://localhost:${port}`)
})
