import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MaterialTable from "material-table";
import { List, ThemeProvider, createTheme } from "@mui/material";
import { forwardRef } from "react";
import AddBox from "@mui/icons-material/AddBox";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import Check from "@mui/icons-material/Check";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Clear from "@mui/icons-material/Clear";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Edit from "@mui/icons-material/Edit";
import FilterList from "@mui/icons-material/FilterList";
import FirstPage from "@mui/icons-material/FirstPage";
import LastPage from "@mui/icons-material/LastPage";
import Remove from "@mui/icons-material/Remove";
import SaveAlt from "@mui/icons-material/SaveAlt";
import Search from "@mui/icons-material/Search";
import MainButton from "../../ExistingCycle/ExistingItem/Sub-Pages/assets/MainButton";
import swal from "sweetalert";
import { useRef } from "react";
import { useMemo } from "react";
import { saveAs } from "file-saver";
import * as FileSaver from 'file-saver'
import XLSX from 'sheetjs-style'
// import * as XLSX from 'xlsx';
import Frame from "../../Components/MainFrame/Frame";
const Xproduct = () => {
    let navigate = useNavigate();
    const [filteredPostData, setFilteredPostData] = useState([]);
    const [filteredChoosedData, setFilteredChoosedData] = useState([]);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [choosedData, setChoosedData] = useState([]);
    const [postArray, setPostArray] = useState([]);
    const selectRef = useRef();
    const defaultMaterialTheme = createTheme();
    const [Products, setProducts] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [validateData, setValidatedData] = useState([]);
    const [failedvalidateData, setFailedValidatedData] = useState([]);




    // export data frpm edit selected all selected star product 
    const fileType = "application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const fileExtension = '.xlsx';

    //EXPORT TO EXCEL SHEET 
    const exportToExcel = async (items, name) => {
        const ws = XLSX.utils.json_to_sheet(items);
        const wb = { Sheets: { "data": ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
        const data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(data, name + fileExtension);
    }

    //TABLE ICONS 
    const tableIcons = {
        Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
        Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
        Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
        Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
        DetailPanel: forwardRef((props, ref) => (
            <ChevronRight {...props} ref={ref} />
        )),
        Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
        Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
        Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
        FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
        LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
        NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
        PreviousPage: forwardRef((props, ref) => (
            <ChevronLeft {...props} ref={ref} />
        )),
        ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
        Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
        SortArrow: forwardRef((props, ref) => (
            <ArrowDownward {...props} ref={ref} />
        )),
        ThirdStateCheck: forwardRef((props, ref) => (
            <Remove {...props} ref={ref} />
        )),
        // ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
    };

    let [tableData, setTableData] = useState([]);
    const columns = [
        { title: "ID", field: "ID" },
        { title: "Description", field: "Description" },
        { title: "SKU", field: "ItemLookupCode" },
    ];

    //Get ALL ITEMS.
    useEffect(() => {
        async function getAllData() {
            try {
                setIsTableLoading(true);
                let tableRes = await axios.get(
                    `http://192.168.26.15/cms/api/ex-itemz`
                );
                console.log('AllData res ==>', tableRes);

                setIsTableLoading(false);
                setTableData(tableRes.data.Item);
                const productData = tableRes.data.Item;
                setProducts(productData)
            } catch (error) {
                console.log(error);
                setIsTableLoading(false);
            }
        }
        getAllData();
    }, []);
    // Handling functions Start
    // Handling StoreID value onChange

    //start handle bulk
    const downloadFile = (event) => {
        event.preventDefault();
        saveAs(`http://192.168.26.15/cms/temps/Accrual-EX.xlsx`);
    };

    const [productData, setProductData] = useState(null);
    const [fileData, setFileData] = useState([]);

    //Handel when file uploaded
    const handleFile = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            console.log('sheetData', sheetData)

            sheetData.filter((item) => {

                const pData = Products.filter(
                    p => p.ItemLookupCode === String(item.lookupcode)
                );
                console.log(pData, "hi hi");

                if (pData) {
                    setProductData(pData);
                }

            });
            const finalData = sheetData.filter((data) => data.phone.length == 13);
            console.log('finalData ==== > ', finalData)





            const validationFun = async () => {
                let res = await axios.get('http://192.168.26.15/cms/api/ex-validation', {
                    params: [...finalData]
                })
                console.log('validation res ====>', res.data)
                finalData.map((item1) => {
                    let flag = 0, ItemID
                    res.data['Success'].map((item2) => {
                        if (item1.ItemLookupCode == item2.ItemLookupCode) {
                            flag++;
                            ItemID = item2.ItemID
                        }
                    })
                    if (flag != 0) {
                        setValidatedData((prev) => [...prev, { ...item1, ItemID, user }])
                    } else {
                        setFailedValidatedData((prev) => [...prev, item1])
                    }
                });


              



            }
            validationFun();








            // const isValidTemplate =
            //     sheetData.length > 0 &&
            //     sheetData[0].ItemLookupCode !== undefined


            // if (isValidTemplate) {
            //     const validData = sheetData.filter(
            //         (data) => data.ItemLookupCode
            //     );

            //     if (validData.length > 0) {
            //         swal({
            //             text: 'Items uploaded successfully',
            //             icon: 'success',
            //             button: false,
            //             timer: 1200,
            //         });
            //     } else {
            //         swal({
            //             title: `Hey.. ${JSON.parse(sessionStorage.getItem('userData'))?.name
            //                 }`,
            //             text: 'Please use the correct template!',
            //             icon: 'error',
            //             button: false,
            //             timer: 4000,
            //         });
            //     }

            //     setFileData(validData);
            // } else {
            //     console.error('Invalid template structure');
            //     swal({
            //         title: `Hey.. ${JSON.parse(sessionStorage.getItem('userData'))?.name
            //             }`,
            //         text: 'Invalid template structure!',
            //         icon: 'error',
            //         button: false,
            //         timer: 4000,
            //     });
            // }
        };

        reader.readAsArrayBuffer(file);
    };


    let user = JSON.parse(sessionStorage.getItem("userData"))?.id;

    const finalArr = fileData.map((item) => ({ ...item, user, IsAccrualExcluded: 1 }));

    console.log(finalArr, 'post');


    async function formSubmit(e) {
        e.preventDefault();
        setIsLoading(true);
        console.log('FINAL FINAL ARR ', validateData)

        try {
            if (validateData.length > 0) {
                const response = await axios.post(
                    "http://192.168.26.15/cms/api/add-bulkexitem",
                    [...validateData]
                );
                if (response.data.message) {
                    swal({
                        title: "Products updated successfully",
                        icon: "success",
                        button: false,
                        timer: 3000,
                    });
                    setFileData([]);
                    // setTimeout(() => {
                    //   navigate("/mainpage/itemadjust/StarProducts", {
                    //     replace: true,

                    //   });
                    // }, 2000);
                }
            }
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            setIsLoading(false);

            swal({
                title: `Hey.. ${JSON.parse(sessionStorage.getItem('userData'))?.name
                    }`,
                text: 'LookupCode already Exists OR Wrong!',
                icon: 'error',
                button: false,
                timer: 4000,
            });
        }
    }
    //End
    console.log('final Array', finalArr)

    // rfemove item from submitted array 
    const handleDeleteItem = (index, e) => {
        e.preventDefault()

        let list = [...filteredChoosedData];
        console.log('ilteredChoosedData===>', filteredChoosedData);
        let listPost = [...filteredPostData];
        list.splice(index, 1);
        console.log('AFTERREMOVING==>', list)

        listPost.splice(index, 1);
        setChoosedData(list);
        setFilteredChoosedData(list);
        setPostArray(listPost);
        setFilteredPostData(listPost);
    };
    const handleSubmit = async (e) => {
        setIsLoading(true);
        e.preventDefault();
        console.log("filteredChoosedData /////////////////", filteredChoosedData)
        try {
            let postRes = await axios.post(
                "http://192.168.26.15/cms/api/add-exitem",
                filteredChoosedData
                // filteredPostData
            );
            console.log("postRes===>", postRes.data.message)
            // console.log(postRes);
            if (postRes.data.message) {
                setIsLoading(false);
                swal({
                    text: "Data updated successfully",
                    icon: "success",
                    button: false,
                    timer: 1000,
                });
                setChoosedData([]);
                selectRef.current.value = "";
                setPostArray([]);
            } else {
                swal("An error occurred,Please try again ", "error");
            }
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    };

    const handleAddingNewItem = (props) => {
        console.log('lllllllllllllll')
        const newItem = {
            ItemID: props.data.ID,
            ItemLookupCode: props.data.ItemLookupCode,
            Description: props.data.Description,
            user: user,
            IsAccrualExcluded: 1
        };

        // Check if new item exists in selectedItems
        const exists = selectedItems.some((item) => item.itemID === newItem.ItemID);

        if (exists) {
            // Show error
            swal("Error", "Item already Exsits in the table", "error");
        } else {
            // Add new item
            setPostArray((prev) => [...prev, newItem]);
            setChoosedData((prev) => [...prev, newItem]);
        }
    };

    //  Handling functions End.
    const choosedDataMemo = useMemo(() => {
        setFilteredChoosedData(
            choosedData.reduce((object, current) => {
                const x = object.find((item) => item.ItemID === current.ItemID);
                if (!x) {
                    swal({
                        text: "Item Added Successfully",
                        icon: "success",
                        button: false,
                        timer: 800,
                    });

                    return object.concat([current]);
                } else {
                    swal({
                        text: "You already added this item",
                        icon: "error",
                        button: true,
                    });

                    return object;
                }
            }, [])
        );
    }, [choosedData]);

    const postDataMemo = useMemo(() => {
        setFilteredPostData(
            postArray.reduce((object, current) => {
                const x = object.find((item) => item.item_id === current.item_id);
                if (!x) {
                    return object.concat([current]);
                } else {
                    return object;
                }
            }, [])
        );
    }, [postArray]);
    // End
    // console.log(filteredChoosedData, "choosedData", filteredPostData, "post");




    const [viewMode, setViewMode] = useState("select");
    const fetchItems = async () => {
        const response = await axios.get(
            "http://192.168.26.15/cms/api/all-exitems"
        );
        console.log('modeSelected', response)
        setSelectedItems(response.data.Ex_Item);
    };
    useEffect(() => {
        if (viewMode === "edit") {

            fetchItems();
        }
    }, [viewMode]);



    async function removeItem(id) {

        try {

            const response = await fetch(`http://192.168.26.15/cms/api/remove-exitem/${id}`, {
                method: 'POST'
            });
            console.log('removing res===>', response)
            const data = await response.json();
            console.log('data ', data)
            if (data.message.includes('successfully')) {
                fetchItems()
                swal({
                    text: 'Item removed successfully',
                    icon: 'success',
                    button: false,
                    timer: 1200,
                });

                // Remove item from state  
                setSelectedItems(prevItems =>
                    prevItems.filter(item => item.id !== id)
                );
            } else {
                swal({
                    text: 'Something happened try again later !',
                    icon: 'error',
                    button: false,
                    timer: 1200,
                });
            }

        } catch (error) {

            // Handle error  
            console.log(error);
            alert('Unable to remove item');

        }

    }

    console.log('validatedItems ====>', validateData)

    return (
        <Frame headerLabel="Accrual">
            <React.Fragment>
                <nav className="navbar navbar-light bg-light">
                    <div className="container-fluid">
                        <button
                            onClick={() => setViewMode("select")}
                            className={`btn ${viewMode === "select" ? "btn-primary" : "btn-secondary"
                                }`}
                        >
                            Select few
                        </button>

                        <button
                            onClick={() => setViewMode("bulk")}
                            className={`btn ${viewMode === "bulk" ? "btn-success" : "btn-secondary"
                                }`}
                        >
                            Upload Bulk
                        </button>

                        <button
                            onClick={() => setViewMode("edit")}
                            className={`btn ${viewMode === "edit" ? "btn-primary" : "btn-secondary"
                                }`}
                        >
                            Edit Selected
                        </button>
                    </div>
                </nav>
                {viewMode === "select" && (
                    <section
                        id=""
                        className="row m-0 p-0 justify-content-center align-items-start vh-100 overflow-scroll p-3"
                    >
                        <div className="col-12">
                            <div style={{}}>
                                {/* Start */}
                                <div className="mt-5">
                                    <ThemeProvider theme={defaultMaterialTheme}>
                                        <MaterialTable
                                            align="center"
                                            style={{ height: "100%" }}
                                            icons={tableIcons}
                                            title={
                                                <>
                                                    <span className="fs-4  text-success mx-1">
                                                        Search and Select from Products table
                                                    </span>
                                                </>
                                            }
                                            columns={columns}
                                            data={tableData}
                                            actions={[
                                                {
                                                    icon: "add",
                                                    tooltip: "Save User",
                                                    onClick: (event, rowData) => { },
                                                },
                                            ]}
                                            components={{
                                                Action: (props) => (
                                                    <button
                                                        onClick={(e) => {
                                                            handleAddingNewItem(props);
                                                        }}
                                                        className="btn btn-success rounded-circle mx-3"
                                                    >
                                                        <i class="fa-solid fa-sack-xmark"></i>
                                                    </button>
                                                ),
                                            }}
                                            options={{
                                                actionsColumnIndex: -1,
                                                headerStyle: {
                                                    backgroundColor: "#00a886",
                                                    color: "#FFF",
                                                },
                                            }}
                                        />
                                    </ThemeProvider>
                                </div>
                                {/* Enddd */}

                                {filteredChoosedData.length > 0 && (
                                    <>
                                        <form>
                                            <table className="table table-striped border round-3 my-3">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">#</th>
                                                        <th scope="col">Lookup Code</th>
                                                        <th scope="col">Description</th>
                                                        <th scope="col">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredChoosedData.map((item, index) => {
                                                        return (
                                                            <tr key={index}>
                                                                <th scope="row">{index + 1}</th>
                                                                <td>{item.ItemLookupCode}</td>
                                                                <td>{item.Description}</td>
                                                                <td>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            handleDeleteItem(index, e);
                                                                        }}
                                                                        className="btn btn-danger"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </form>

                                        <div className="text-end w-100 my-3">
                                            <MainButton
                                                type="submit"
                                                onClick={handleSubmit}
                                                value={
                                                    isLoading ? (
                                                        <i className="fa-solid fa-circle-notch  fa-spin"></i>
                                                    ) : (
                                                        "Submit"
                                                    )
                                                }
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </section>
                )}


                {viewMode === "bulk" && (
                    <React.Fragment>
                        <h1> Accrual Execluded Items Bulk Update</h1>
                        <form className="row mt-4" onSubmit={formSubmit}>
                            <div className="row mb-4">
                                <div className="form-group">

                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="exampleFormControlSelect1">
                                    <h4>Upload Products</h4>
                                </label>
                                <div className="col-6">
                                    <input
                                        type="file"
                                        className="form-control "
                                        onChange={(e) => {
                                            handleFile(e);
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="row pt-5">
                                <div className="col-12">
                                    <h4>
                                        Download the template that should be used if you don't have it
                                    </h4>
                                </div>
                                <div className="col-12">
                                    <button className="btn bt-sm btn-success" onClick={downloadFile}>
                                        Download
                                    </button>
                                </div>
                            </div>
                            {validateData.length > 0 && (
                                <>
                                    <table className="table table-striped border round-3 my-3">
                                        <thead>
                                            <tr>
                                                <th>LookupCode</th>
                                                <th>Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {validateData.map((item, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <input
                                                            hidden
                                                            name="itemID"
                                                            type="number"
                                                            className="form-control"
                                                            value={productData.ID}
                                                        />
                                                        <input
                                                            disabled
                                                            id={`lookupcode_${index}`}
                                                            name={`ItemLookupCode_${index}`}
                                                            type="text"
                                                            className="form-control"
                                                            value={item.ItemLookupCode}
                                                        />
                                                    </td>

                                                    <td>
                                                        <input
                                                            disabled
                                                            name="Description"
                                                            type="text"
                                                            className="form-control"
                                                            value={item.Description}
                                                        />
                                                    </td>

                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <div className="col-12 me-auto d-flex justify-content-end mt-4">
                                        <MainButton type="submit" value={isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : "Submit"} />
                                    </div>
                                </>
                            )}
                        </form>
                        {
                            failedvalidateData.length > 0 && <button type="" className="btn btn-danger" onClick={() => {
                                exportToExcel(failedvalidateData, 'failed items')
                            }}>Export Failed Items </button>
                        }
                    </React.Fragment>
                )}


                {viewMode === "edit" && (
                    <div>
                        <button onClick={() => {
                            exportToExcel(selectedItems, 'selectedItems')
                        }} className="text-white p-2 mt-3 outline-none border-0 rounded bg-black ">Export Selected accrual Execluded Items  <i className="fa-solid fa-download"></i></button>

                        <table className="table table-striped border round-3 my-3">
                            <thead>
                                <tr>
                                    <th scope="col">ID</th>
                                    <th scope="col">LookupCode</th>
                                    <th scope="col">Description</th>
                                    <th scope="col">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {console.log('selectedItems=====>', selectedItems)}
                                {selectedItems != undefined && selectedItems.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.ItemLookupCode}</td>
                                        <td>{item.Description}</td>
                                        <td>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="btn btn-danger btn-sm"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}


            </React.Fragment>
        </Frame>
    );
};
export default Xproduct;