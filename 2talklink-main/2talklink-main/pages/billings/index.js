import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useDispatch } from 'react-redux';
import { common } from '../../src/helper/Common';
import { setPageHeading } from '../../src/redux/actions/commonAction';
import moment from 'moment';
import svg from '../../src/helper/svg';
import { Tooltip } from '@mui/material';

const Billings = () => {
    const [orderList, setOrderList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [expiresDate, setExpireDate] = useState([]);

    let dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageHeading({
            pageHeading: "Billing History",
            title: "Billing History",
        }));
    }, [dispatch]);

    const fetchBillings = async (page, listPerPage=perPage, nchange=false) => {
        setLoading(true);
        common.getAPI(
            {
                method: "POST",
                url: 'user/getBillingHistory',
                data: {page: page, listPerPage: listPerPage, searchTerm: searchTerm}
            },
            (resp) => {
                if(resp.status === 'success'){
                    setOrderList(resp?.data);
                    setPerPage(listPerPage);
                    setExpireDate(resp?.expireDate)
                    setTotalRows(resp?.totalOrders);
                }
                setLoading(false);
            }
        );
    };
    const handlePageChange = (page) => {
		fetchBillings(page);
	};
    const handlePerRowsChange = async (newPerPage, page) => {
        setLoading(true);
        fetchBillings(page, newPerPage, true);
    }
    const handleSearchKeyupEvent = async (e) => {
        let t = e.target;
		let searchTerm = t.value;
        setSearchTerm(searchTerm);
        if (e.keyCode === 13) {
            fetchBillings(1);
        }
    }

    useEffect(() => {
        fetchBillings(1);
    }, []);


    const columns = [
        {
            name: '#S.N.',
            width : '80px',
            center : true,
            cell : (row, index) => (<span>{'#'+(index + 1)}</span>)
        },
        {
            name: 'Plan Name',
            width: '130px',
            selector: row => row.title,
            sortable: true,
        },
        {
            name: 'Amount',
            width: '110px',
            selector: row => row.amount,
            sortable: true,
        },
        {
            name: 'Currency',
            width: '115px',
            selector: row => row.currency.toUpperCase(),
            sortable: true,
        },
        {
            name: 'Payment Status',
            selector: row => row.paymentStatus,
            sortable: true,
        },
        {
            name: 'Payment Method',
            width: '100px',
            selector: row => row.paymentMethod,
            sortable: true,
        },
        {
            name : 'Coupon',
            selector : row => row.couponCode ,
        },
        {
            name: 'Validity',
            width: '100px',
            selector: row => row.validity + ' Days',
            sortable: true,
        },
        {
            name: 'Purchased Date',
            selector: row => row.createdAt,
            sortable: true,
        },
        {
            name: 'Invoice',
            width: '100px',
            selector: row => row.invoice_url,
            sortable: true,
            cell : (row, index) => (
                <div className="pu_datatable_btns">
                    {row.invoice_url === 'AdminAssigned' 
                    ? 'No Invoice' 
                    :
                    <Tooltip title="Download" placement="top" arrow>
                        <a href={row.invoice_url} target="_blank" className="pu_dt_btn download" rel="noreferrer">{svg.download}</a>
                    </Tooltip>

                    }
               </div>
            )
        },
        
    ];

    const data = [];
    if(orderList.length) {
        orderList.forEach((item, index) => {

            const newItem = {
                id : item._id,
                title: item.title,
                amount: item.amount,
                currency: item.currency,
                validity: item.validity,
                paymentStatus:item.paymentStatus,
                paymentMethod:item.paymentMethod,
                invoice_url:item.invoice_url,
                couponCode : (item.couponCode != undefined && item.couponCode !='') ? item.couponCode : '-',
                createdAt: common.dateFormatter(item.createdAt),
            }
            data.push(newItem);
        });
    }

    const userPopupCloseHandler = (e) => {
        setAddUserPopup(false);
        //Reset popup form start
        setTimeout(() => {
            manageIsEdit(false);
            setEditId('');
            setName('');
            setEmail('');
            setPassword('');
        }, 100);
    };

    /* refresh user list after action start */
    const refreshorderList = () => {
        fetchBillings(1)
    }
    /* refresh user list after action end */

    
    const handleOtoChange = (event) => {
        const {
            target: { value },
        } = event;
        setOtoName(
            typeof value === 'string' ? value.split(',') : value,
        );
    };
    
    return (
        <>
            <div className="pu_container">
                <div className="pu_datatable_wrapper">
                    <div className="pu_pagetitle_wrapper">
                        <div>
                        <h3>Payment History ({totalRows})</h3>
                        {expiresDate ? <h4>Your plan will expire on ( {moment(expiresDate).format("DD-MMM-YYYY")} )</h4> :''}
                        </div>
                        <div className="pu_pagetitle_right">
                            <div className="pu_search_wrapper">
                                {/* <input type="text" placeholder="Search" onKeyUp={handleSearchKeyupEvent} /> */}
                                {/* <span className="pu_search_icon">{svg.search_icon}</span> */}
                            </div>
                        </div>
                    </div>
                    <DataTable
                        columns={columns}
                        data={data}
                        progressPending={loading}
                        pagination
                        paginationServer
                        paginationTotalRows={totalRows}
                        onChangeRowsPerPage={handlePerRowsChange}
                        onChangePage={handlePageChange}
                    />
                </div>
            </div>

        </>
    );
}
export default Billings;
