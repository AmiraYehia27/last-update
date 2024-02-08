import React, { useEffect, useState } from 'react';
import Frame from '../../Components/MainFrame/Frame';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import Button from '@mui/material/Button';
import Typewriter from 'typewriter-effect/dist/react';
import { read, utils } from 'xlsx';
import { saveAs } from "file-saver";
import XLSX from 'sheetjs-style';
import * as FileSaver from 'file-saver'
import Swal from "sweetalert";


const KVIScreenMain = () => {
    // handel upload file
    const handleFileChange = (event) => {
        console.log('handleFileChange: ', event);
        console.log('files: ', event.target.files);
        const fileList = event.target.files;
        console.log('array: ', Array.isArray(fileList));

        // no file has been selected
        if (Object.keys(fileList).length === 0) return;

        const file = fileList[0]; // single file upload
        console.log('file: ', file);
        const reader = new FileReader();
        console.log(reader)
        reader.onload = (e) => {
            console.log('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk')
            // e !== event
            console.log("e", e)
            //********************************************* */
            const bstr = e.target.result;
            console.log("bstr", bstr)
            const workBook = read(bstr, { type: 'binary' });
            console.log("workBook", workBook)
            const workSheetName = workBook.SheetNames[0];
            console.log("workSheetName", workSheetName)
            const workSheet = workBook.Sheets[workSheetName];
            console.log("workSheet", workSheet)
            const fileData = utils.sheet_to_json(workSheet, { header: 2 });
            console.log('fileData: ', fileData);
            // setExelData([...fileData]);

            // validation API 
            let validateFun = async () => {
                let res = await axios.get('http://192.168.26.15/cms/api/kvi-validation', { params: [...fileData] });
                const data = await res.data;



                console.log('VALIDATION data ====>', data);
                setExelData(data);
                let editedData = [];
                data.map((item, index) => {
                    editedData.push({ ...item, id: index })
                })
                console.log('editedData====>', editedData)
                setValidatedExelData([...editedData]);

                fileData.map((item) => {
                    console.log("item", item);
                    let flag = 0
                    data.map((item2) => {
                        console.log("item2", item2)
                        if (item.ItemLookupCode == item2.ItemLookupCode) {
                            flag++
                        }
                    })
                    if (flag == 0) {
                        setFailedExelData((prev) => [...prev, item])
                    }
                })

            }
            validateFun()
        };
        reader.readAsBinaryString(file);
        console.log('event.target.value: ', event.target.value);
        event.target.value = null;

    };

    // the default value of tab 
    const [value, setValue] = useState('1');

    // set the accrual items 
    const [rows, setRows] = useState([])

    // error of removing 
    const [message, setmessage] = useState('');

    // excel data 
    const [excelData, setExelData] = useState([]);

    // validated Data of excel sheet upload 
    const [validatedExcelData, setValidatedExelData] = useState([]);

    // failed Data of excel sheet upload 
    const [failedExcelData, setFailedExelData] = useState([]);

    //handel skip tabs 
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    // identify columns 
    const columns = [
        { field: 'ItemID', headerName: 'ID', width: 120 },
        {
            field: 'ItemLookupCode',
            headerName: 'Item LookupCode',
            width: 200,
            editable: false,
        },
        {
            field: 'Description',
            headerName: 'Description',
            width: 300,
            editable: false,
        },
        {
            field: "action",
            headerName: "Action",
            width: 200,
            sortable: false,
            renderCell: (params) => {
                const onClick = async (e) => {
                    e.stopPropagation(); // don't select this row after clicking
                    console.log('params==> ', params.row.ItemID);
                    let res = await axios.put(`http://192.168.26.15/cms/api/remove-kvi/${params.row.ItemID}`);
                    console.log('remove response ===>', res);
                    console.log(res.data.message)
                    setmessage(res.data.message)
                    getData();

                };

                return <Button variant="contained" onClick={onClick}>Remove</Button>;
            }
        },


    ];

    // function to gat all accrual items 
    const getData = async () => {
        const res = await axios.get('http://192.168.26.15/cms/api/kvi-items');
        console.log(res)
        const data = await res.data.KviItems
        console.log("data====>", data);
        setRows(data)

    }

    useEffect(() => {
        getData()
    }, [])

    useEffect(() => {
        if (message != '') {
            setTimeout(() => {
                setmessage('')
            }, "7000");
        }
    }, [message])

    // download file (Template)
    const downloadFile = (event) => {
        event.preventDefault();
        saveAs(`http://192.168.26.15/cms/temps/KVI-items.xlsx`);
    };

    //Execl Data columns 
    let excelDataCoulmns = [
        { field: 'ItemLookupCode', headerName: 'ItemLookupCode ', width: 200 },
        { field: 'Description', headerName: 'Description', width: 300 },

    ]


    // uploadBulkKvis function
    const uploadBulkKvisHandler = async () => {
        console.log('EXCEL DATA BEFORE POST', validatedExcelData);
        try {
            let res = await axios.post('http://192.168.26.15/cms/api/add-kvi', validatedExcelData);
            console.log('upload res', res);
            setmessage('your Kvi items uploaded successfully...');
            Swal({
                title: " GREAT ",
                text: "Items has been updated successfully... ",
                icon: "success"
              });
        
        } catch (err) {
            console.log(err);
            setmessage('Something went wrong!try again');
            Swal({
                title: " OPS!! ",
                text: "Something went wrong ... ",
                icon: "error"
              });
        }
    }

    // export failed data 
    const fileType = "application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const fileExtension = '.xlsx';
    const exportToExcel = async () => {
        const ws = XLSX.utils.json_to_sheet(failedExcelData);
        const wb = { Sheets: { "data": ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
        const data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(data, 'FailedKVIItems' + fileExtension);
    }
    console.log("rows.length--->", rows.length);

    console.log("excelData ------> ", excelData);
    console.log('VALIDATED ----->', validatedExcelData)
    console.log('FAILED ', failedExcelData);

    return (
        <>
            <div className='frame-container position-relative'>
                <Frame headerLabel="KVI Screen">
                    <div className="box-container z-high bg-white position-relative">
                        <Box sx={{ width: '100%', typography: 'body1' }}>
                            <TabContext value={value}>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <TabList onChange={handleChange} aria-label="lab API tabs example">
                                        <Tab label="View" value="1" />
                                        <Tab label="Add Bulk" value="2" />

                                    </TabList>
                                </Box>
                                <TabPanel value="1">

                                    <Box sx={{ height: 400, width: '100%' }}>
                                        <DataGrid
                                            rows={rows}
                                            columns={columns}
                                            initialState={{
                                                pagination: {
                                                    paginationModel: {
                                                        pageSize: 10,
                                                    },
                                                },
                                            }}
                                            pageSizeOptions={[5]}
                                            disableRowSelectionOnClick
                                        />

                                    </Box>
                                </TabPanel>
                                <TabPanel value="2">
                                    <div className='file-container z-high position-relative bg-white p-2 mt-3 rounded  w-75 m-auto'>
                                        <div className='d-flex justify-content-between'>
                                            <label htmlFor="file">Upload Shelf Items </label>
                                            <button className='border-0 bg-transparent fst-italic text-decoration-underline ' onClick={downloadFile}>Click here to download the template  </button>
                                        </div>
                                        <input onChange={handleFileChange}
                                            type="file" name="file" id="file"
                                            accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                        />
                                    </div>
                                    <div>
                                        {
                                            validatedExcelData.length > 0 && <Box sx={{ height: 400, width: '100%' }}>
                                                <DataGrid
                                                    rows={validatedExcelData}
                                                    columns={excelDataCoulmns}
                                                    initialState={{
                                                        pagination: {
                                                            paginationModel: {
                                                                pageSize: 10,
                                                            },
                                                        },
                                                    }}
                                                    pageSizeOptions={[5]}
                                                    disableRowSelectionOnClick
                                                />
                                                <div>
                                                    <Button variant="contained" className='uploadkvibtn' onClick={uploadBulkKvisHandler}>Submit</Button>

                                                    {
                                                        failedExcelData.length > 0 && <Button variant="contained" className='uploadkvibtn bg-danger' onClick={exportToExcel}>Export Failed Items</Button>
                                                    }

                                                </div>

                                            </Box>
                                        }

                                    </div>
                                </TabPanel>

                            </TabContext>
                            {console.log("message", message)}
                            {
                                message ? message.includes('wrong') ? <div className='fail'><Typewriter
                                    options={{
                                        strings: message.toUpperCase(),
                                        autoStart: true,
                                    }} /></div> : <div className=' success'>
                                    <Typewriter
                                        options={{
                                            strings: message.toUpperCase(),
                                            autoStart: true,
                                        }} />
                                </div> : ''
                            }
                        </Box>
                    </div>


                </Frame>
                <div className="layer position-absolute top-0 bottom-0 left-0 right-0 bg-black opacity-50"></div>

            </div>


        </>

    );
}

export default KVIScreenMain;
