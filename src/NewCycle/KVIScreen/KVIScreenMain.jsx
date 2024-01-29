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
            const fileData = utils.sheet_to_json(workSheet, { header: 1 });
            console.log('fileData: ', fileData);
            let newFileData = fileData.map((arr) => Object.assign({}, arr));
            console.log(newFileData)
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
    const [message, setmessage] = useState('')

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
        // {
        //     field: 'NumberFormat',
        //     headerName: 'Number Format',
        //     width: 120,
        //     editable: false,
        // },
        {
            field: "action",
            headerName: "Action",
            width: 200,
            sortable: false,
            renderCell: (params) => {
                const onClick = async (e) => {
                    e.stopPropagation(); // don't select this row after clicking
                    console.log('params==> ', params.row.ItemID);
                    let res = await axios.put(`http://192.168.26.15/cms-test/api/remove-kvi/${params.row.ItemID}`);
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
        const res = await axios.get('http://192.168.26.15/cms-test/api/kvi-items');
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
            }, "5000");
        }
    }, [message])







    console.log("rows.length--->", rows.length)
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
                                            <button className='border-0 bg-transparent fst-italic text-decoration-underline  '>Click here to download the template  </button>
                                        </div>
                                        <input onChange={handleFileChange}
                                            type="file" name="file" id="file"
                                            accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                        />
                                    </div>
                                </TabPanel>

                            </TabContext>
                            {
                                message ? <Typewriter
                                    options={{
                                        strings: message.toUpperCase(),
                                        autoStart: true,
                                    }} /> : ""
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
