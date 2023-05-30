const express = require('express'); 
const path = require('path'); 
const bodyParser = require('body-parser')
const app = express(); 
const port = 5000; // 포트 넘버 설정 
const cors = require('cors');
const { exec , spawn } = require('child_process');

const xlsx = require('xlsx');

const fileUpload = require('express-fileupload');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload());


const fs = require('fs');

// 파일을 저장할 경로와 파일 이름
const filePath = 'uploads/';
const fileName = 'example.txt';

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
      cb(null, uploadPath); // 파일 업로드 경로
    },
    filename: function (req, file, cb) {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
      cb(null, file.originalname);
    }
  });

  const upload = multer({
    storage: storage,
  });

app.use(cors());



let fileList = [];
const directoryPath = path.join(__dirname, 'uploads');

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  } 

  fileList = files;
});


app.post('/api', (req, res)=>{
    console.log(req.body)
  res.send({ test: "hi"});
});

app.post('/runBatchFile2', (req, res)=>{

const fileInfo = req.body.fileInfo;

console.log(fileInfo.index)


  exec(path.join(__dirname, 'file' + fileInfo.index + ".bat"), (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(stdout);
  });
    
    res.send({});
  });

// app.post('/runBatchFile', (req, res)=>{


  
//   const filePath = path.join(__dirname, 'file_list.txt')

// // 파일 내용을 문자열로 읽어오기
// const fileContent = fs.readFileSync(filePath, 'utf-8');

// // 줄 단위로 문자열 분리하여 배열로 만들기
// const fileLines = fileContent.trim().split('\n');
// console.log(fileLines)
    
//     res.send({});
//   });


app.post('/runBatchFile', (req, res)=>{

  const fileInfo = req.body.sheetName;


  let batList = '';

  fileList.map((data) => {
    if(batList === ''){
      batList += `@echo off
    chcp 65001
    Start C:\\Sejin\\server\\uploads\\"${data}"
    `
    }else {
      batList += `
     
    @echo off
    chcp 65001
    Start C:\\Sejin\\server\\uploads\\"${data}"
    `
    }
    
  })

let content = `@echo off
chcp 65001

set name="${fileInfo}"
Start C:\\Sejin\\server\\uploads\\%name%
cmd/k 
`;


fs.writeFileSync(path.join(__dirname, 'openfile_last.bat'), content,{ encoding: 'utf8' } , (err) => {
  
  if (err) throw err;
  console.log('example.bat file is created!');

  // exec(path.join(__dirname, 'openfile_last.bat'), (err, stdout, stderr) => {
  //   if (err) {
  //     console.error(err);
  //     return;
  //   }
  //   console.log(stdout);
  // });
});
    
   exec(path.join(__dirname, 'openfile_last.bat'), (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(stdout);
  });
    res.send({});
  });


// app.post('/runBatchFile', (req, res)=>{

// const content = `@echo off 
// cmd/k 
// `;

// // fs.writeFileSync(path.join(__dirname, 'openfile2.bat'), content, { encoding: 'utf8' }, (err) => {
// //   if (err) throw err;
// //   console.log('example.bat file is created!');

// //   // exec(path.join(__dirname, 'openfile2.bat'), (err, stdout, stderr) => {
// //   //   if (err) {
// //   //     console.error(err);
// //   //     return;
// //   //   }
// //   //   console.log(stdout);
// //   // });

// // });


  
//   // exec(path.join(__dirname, 'openfile.bat'), (err, stdout, stderr) => {
//   //   if (err) {
//   //     console.error(err);
//   //     return;
//   //   }
//   //   console.log(stdout);
//   // });
  
//   res.send({});
// });

// app.post('/runBatchFile', (req, res) => {
//   const input = '6월 CJ.xlsx';
//   const bat = spawn('cmd.exe', [path.join(__dirname, 'openfile.bat'), input]);

//   bat.stdout.on('data', (data) => {
//     console.log(data.toString() + "ee");
//   });

//   bat.stderr.on('data', (data) => {
//     console.error(data.toString() + "error");
//   });

//   bat.on('exit', (code) => {
//     console.log(`Child process exited with code ${code}`);
//     res.send({});
//   });
// });


app.post('/resetFileList', (req, res)=>{
  
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    } 
  
    fileList = files;
  });
  
  res.send({});
});


app.post('/fileList', async (req, res) => {

  // const files = fs.readdirSync(path.join(__dirname, 'uploads'));

  let fileListResult = [];
  // 각 파일에서 시트명 추출
  const sheetNames = [];
  fileList.forEach((file) => {
    let filesSheets = [];
    const workbook = xlsx.readFile(path.join(__dirname, 'uploads', file));
    sheetNames.push(...workbook.SheetNames);
    filesSheets.push(...workbook.SheetNames)
    
    fileListResult.push({fileName : path.basename(file), sheetList : filesSheets})
  });


  // res.send({fileList : fileList , uniqueSheetNames : tt});

  // res.send({fileList : fileListResult});
  res.send(fileListResult);


  // res.send(fileList);
})


app.post('/viewExcel', (req, res) => {
  const fileName = '6월 CJ.xlsx'; // 로컬에 저장된 엑셀 파일명
  const filePath = path.join(__dirname, 'uploads', fileName); // 엑셀 파일 경로

  try {
    const workbook = xlsx.readFile(filePath); // 엑셀 파일 읽기
    const sheetName = workbook.SheetNames[0]; // 첫 번째 시트 이름 가져오기
    const worksheet = workbook.Sheets[sheetName]; // 첫 번째 시트 가져오기

    // 엑셀 데이터를 2차원 배열로 변환하기
    const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    const data = rows.map(row => row.map(cell => ({ value: cell })));

    // SheetRenderer 컴포넌트를 사용하여 엑셀 데이터 보여주기
    // res.send(`
    //   <html>
    //     <head>
    //       <link rel="stylesheet" href="https://unpkg.com/react-spreadsheet/dist/index.css" />
    //     </head>
    //     <body>
    //       <div style="height: 100vh">
    //         <SheetRenderer data={${JSON.stringify(data)}} />
    //       </div>
    //       <script src="https://unpkg.com/react/umd/react.production.min.js"></script>
    //       <script src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
    //       <script src="https://unpkg.com/react-spreadsheet/dist/index.umd.min.js"></script>
    //     </body>
    //   </html>
    // `);

    res.send(data)
  } catch (error) {
    res.send('Error: ' + error.message);
  }
});



app.post('/searchHeader', async (req, res) => {


  let fileTest = [];
  fileList.map((data) => {
    fileTest.push(path.join(__dirname, 'uploads', data))
  })



  const files = fileTest;
  let errorSheetList = [];

  let headerCellList = [];
  const searchKeyword = ["학교가", "행사가", "단위", "제품명", "품명", "규격", "유통기한"]

  for (const file of files) {
    const workbook = xlsx.readFile(file);
    const sheetNames = workbook.SheetNames;
  
    for (const sheetName of sheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      let range = null;
  
      try {
        range = xlsx.utils.decode_range(worksheet['!ref']);
      } catch (e) {
        // console.log(`${path.basename(file)} - ${sheetName} `);
        errorSheetList.push(`${path.basename(file)} - ${sheetName} `)
        continue;
      }
  
      let headerCell = [];
      let sheetInfo = {};
  
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = { c: C, r: R + 1 };
          const cellRef = xlsx.utils.encode_cell(cellAddress);
          const cell = worksheet[cellRef];
  
          if (cell && searchKeyword.includes(cell.v.toString().replace(/\s/g, ''))) {
            const rowNumber = R;
            const row = [];
  
            for (let C = range.s.c; C <= range.e.c; ++C) {
              const cellRef1 = xlsx.utils.encode_cell({ c: C, r: rowNumber + 1 });
              const cell1 = worksheet[cellRef1];
              if (cell1) {
                row.push(cell1.v);
              }
            }
            headerCell = row;
            sheetInfo = { fileName: path.basename(file), sheetName: sheetName };
          }
        }
      }
  
      headerCellList.push({ headerCell: headerCell, sheetInfo: sheetInfo });
    }
  }

  // files.forEach(file => {
  //   const workbook = xlsx.readFile(file);
  //   const sheetNames = workbook.SheetNames;

  //   sheetNames.forEach(async (sheetName) => {
  //     const worksheet = workbook.Sheets[sheetName];
  //     const range = xlsx.utils.decode_range(worksheet['!ref']);
      


  //     let headerCell = [];
  //     let sheetInfo = {};


  //     for (let R = range.s.r; R <= range.e.r; ++R) {
  //       for (let C = range.s.c; C <= range.e.c; ++C) {
  //         const cellAddress = { c: C, r: R + 1 };
  //         const cellRef = xlsx.utils.encode_cell(cellAddress);
  //         const cell = worksheet[cellRef];

  //         if (cell && searchKeyword.includes(cell.v.toString().replace(/\s/g, ''))) {

  //           const rowNumber = R; // 가져올 행 번호
  //           const row = [];

  //           for (let C = range.s.c; C <= range.e.c; ++C) {
  //             const cellRef1 = xlsx.utils.encode_cell({ c: C, r: rowNumber + 1 });
  //             const cell1 = worksheet[cellRef1];
  //             if (cell1) {
  //               row.push(cell1.v);
  //             }
  //           }
  //           headerCell = row;
  //           sheetInfo = { fileName: path.basename(file), sheetName: sheetName }

  //         }
  //       }
  //     }


  //     headerCellList.push({ headerCell: headerCell, sheetInfo: sheetInfo });

  //   })
  // })


  return res.send(headerCellList);

});


// app.post('/searchHeader', async (req, res) => {


//   let fileTest = [];
//   fileList.map((data) => {
//     fileTest.push(path.join(__dirname, 'uploads', data))
//   })



//   const files = fileTest;


//   let headerCellList = [];
//   const searchKeyword = ["학교가", "행사가", "단위", "제품명", "품명", "규격", "유통기한"]

//   files.forEach(file => {
//     const workbook = xlsx.readFile(file);
//     const sheetNames = workbook.SheetNames;

//     sheetNames.forEach(async (sheetName) => {
//       const worksheet = workbook.Sheets[sheetName];
//       const range = xlsx.utils.decode_range(worksheet['!ref']);
      


//       let headerCell = [];
//       let sheetInfo = {};


//       for (let R = range.s.r; R <= range.e.r; ++R) {
//         for (let C = range.s.c; C <= range.e.c; ++C) {
//           const cellAddress = { c: C, r: R + 1 };
//           const cellRef = xlsx.utils.encode_cell(cellAddress);
//           const cell = worksheet[cellRef];

//           if (cell && searchKeyword.includes(cell.v.toString().replace(/\s/g, ''))) {

//             const rowNumber = R; // 가져올 행 번호
//             const row = [];

//             for (let C = range.s.c; C <= range.e.c; ++C) {
//               const cellRef1 = xlsx.utils.encode_cell({ c: C, r: rowNumber + 1 });
//               const cell1 = worksheet[cellRef1];
//               if (cell1) {
//                 row.push(cell1.v);
//               }
//             }
//             headerCell = row;
//             sheetInfo = { fileName: path.basename(file), sheetName: sheetName }

//           }
//         }
//       }


//       headerCellList.push({ headerCell: headerCell, sheetInfo: sheetInfo });

//     })
//   })


//   return res.send(headerCellList);

// });



app.post('/search', async(req, res) => {

  let fileTest = [];
  // fileList.map((data) => {
  //   fileTest.push(path.join(__dirname, 'uploads', data))
  // });


  // if(req.body.selectedFileList){
  //   console.log(req.body.selectedFileList)
  // }

  
  if(req.body.selectedFileList?.length > 0){
    let selectedFileList = req.body.selectedFileList;
    selectedFileList.map((data) => {
      fileTest.push(path.join(__dirname, 'uploads', data.value))
    })
  }else {

    fileList.map((data) => {
      fileTest.push(path.join(__dirname, 'uploads', data))
    });
  }

  const files = fileTest;

  // const searchKeyword = req.body.keyword;

  const searchKeyword = req.body.keyword.toString().replace(/\s/g, '');

  let results = [];
  let searchList = [];
  let errorSheetList = [];

  for (const file of files) {
    const workbook = xlsx.readFile(file);
    const sheetNames = workbook.SheetNames;

    for (const sheetName of sheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      // const range = xlsx.utils.decode_range(worksheet['!ref']);
      let range = null;

      try{
        range = xlsx.utils.decode_range(worksheet['!ref']);
      } catch (e) {
        errorSheetList.push(`${path.basename(file)} - ${sheetName} `)
        console.error(`Error decoding range for sheet "${sheetName}" in file "${file}":`, e);
        continue;
      }

      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = { c: C, r: R + 1 };
          const cellRef = xlsx.utils.encode_cell(cellAddress);
          const cell = worksheet[cellRef];

          if (cell && cell.v.toString().includes(searchKeyword)) {

            const rowNumber = R; // 가져올 행 번호
            const row = [];

            for (let C = range.s.c; C <= range.e.c; ++C) {
              const cellRef1 = xlsx.utils.encode_cell({ c: C, r: rowNumber + 1 });
              const cell1 = worksheet[cellRef1];
              if (cell1) {
                row.push(cell1.v);
              } else {
                row.push("")
              }
            }

            results.push({ file: path.basename(file), sheetName, cellAddress, value: cell.v, cell: cellRef, list: row });
          }
        }
      }
    }
  }

  searchList.push({ searchResult : results, errorSheetList : errorSheetList})
  return res.send(searchList);
});


// app.post('/search', async(req, res) => {

//   let fileTest = [];
//   fileList.map((data) => {
//     fileTest.push(path.join(__dirname, 'uploads',data))
//   })


//   const files = fileTest;

//   const searchKeyword = req.body.keyword;

//       let results = [];


//       files.forEach(file => {
//         const workbook = xlsx.readFile(file);
//         const sheetNames = workbook.SheetNames;
    
        
//         sheetNames.forEach(async(sheetName) => {
//         const worksheet = workbook.Sheets[sheetName];
//         const range = xlsx.utils.decode_range(worksheet['!ref']);

//         for (let R = range.s.r; R <= range.e.r; ++R) {
//           for (let C = range.s.c; C <= range.e.c; ++C) {
//             const cellAddress = { c: C, r: R + 1 };
//             const cellRef = xlsx.utils.encode_cell(cellAddress);
//             const cell = worksheet[cellRef];
            
//             if (cell && cell.v.toString().includes(searchKeyword)) {

//               const rowNumber = R; // 가져올 행 번호
//               const row = [];
              

//               for (let C = range.s.c; C <= range.e.c; ++C) {
//                   const cellRef1 = xlsx.utils.encode_cell({ c: C, r: rowNumber + 1});
//                   const cell1 = worksheet[cellRef1];
//                   if (cell1) {
//                     row.push(cell1.v);
//                   }else {
//                     row.push("")
//                   }
//                 }

//               results.push({ file : path.basename(file), sheetName, cellAddress, value: cell.v, cell : cellRef, list : row });
//             }
//           }
//         }


//       });

//   })


//       return res.send(results);

// });


app.listen(port, () => console.log(port));