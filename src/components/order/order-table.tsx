// src/components/order/order-table.tsx

import { Table } from '@components/ui/table';
import { useState } from 'react';
import Pagination from '@components/ui/pagination';
import ActionsButton from '@components/ui/action-button';
import { TotalPrice } from '@components/order/price';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import { GrNext, GrPrevious } from 'react-icons/gr';
// import { BsSearch } from 'react-icons/bs';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

export const CreatedAt: React.FC<{ createdAt?: any }> = ({ createdAt }) => {
  return (
    <span className="whitespace-nowrap">
      {dayjs.utc(createdAt).tz(dayjs.tz.guess()).fromNow()}
    </span>
  );
};

export const Status: React.FC<{ item?: any }> = ({ item }) => {
  const status = item?.orderStatus;
  let color = '#000'; // default color

  // Define colors based on orderStatus
  switch (status) {
    case 'Pending':
      color = '#FFA500'; // Orange
      break;
    case 'Shipped':
      color = '#0000FF'; // Blue
      break;
    case 'Delivered':
      color = '#008000'; // Green
      break;
    case 'Cancelled':
      color = '#FF0000'; // Red
      break;
    default:
      color = '#000'; // Black
  }

  return (
    <span className={`status-${status.replace(/\s/g, '_').toLowerCase()}`}>
      <span className="bullet" style={{ backgroundColor: color }} />
      {status}
    </span>
  );
};

const columns = [
  {
    title: 'Order Date',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 140,
    render: function createdAt(items: any) {
      return <CreatedAt createdAt={items} />;
    },
  },
  {
    title: 'Status',
    key: 'orderStatus',
    width: 145,
    render: function status(item: any) {
      return <Status item={item} />;
    },
  },
  {
    title: 'Payment Method',
    dataIndex: 'paymentMethod',
    key: 'paymentMethod',
    width: 140,
  },
  {
    title: 'Total Price',
    key: 'totalPrice',
    width: 130,
    render: function totalPrice(items: any) {
      return <TotalPrice items={items} />;
    },
  },
  {
    dataIndex: '',
    key: 'operations',
    width: 120,
    render: function actionsButton(item: any) {
      return <ActionsButton item={item} />;
    },
    className: 'operations-cell',
  },
];

const OrderTable: React.FC<{ orders?: any }> = ({ orders }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [value, setValue] = useState('');
  const countPerPage = 5;
  let [filterData, setDataValue] = useState(orders?.slice(0, countPerPage));

  const updatePage = (p: any) => {
    setCurrentPage(p);
    const to = countPerPage * p;
    const from = to - countPerPage;
    setDataValue(orders?.slice(from, to));
  };

  const onChangeSearch = (e: any) => {
    setCurrentPage(1);
    let filter: any = orders
      .filter((item: any) =>
        item.stripeOrderId // Assuming stripeOrderId as tracking number
          .toLowerCase()
          .includes(e.target.value.toLowerCase())
      )
      .slice(0, countPerPage);
    setValue(e.target.value);
    if (!e.target.value) {
      updatePage(1);
    }
    setDataValue(filter);
  };

  const onSubmitHandle = (e: any) => {
    e.preventDefault();
  };

  return (
    <>
      <div className="items-center mb-5 md:flex md:justify-between sm:mb-10">
        <h2 className="mb-4 text-sm font-semibold md:text-xl text-brand-dark md:mb-0">
          My Order List
        </h2>
        {/* Uncomment if search functionality is needed
        <form onSubmit={onSubmitHandle} className="relative">
          <span className="absolute ltr:right-3 rtl:left-3 top-[80%] transform -translate-y-1/2 order-icon-color">
            <BsSearch size={19} />
          </span>
          <Input
            name="search"
            type="search"
            value={value}
            onChange={onChangeSearch}
            placeholder="Search Order list"
            inputClassName=" h-[46px] w-full bg-white border border-[#E3E8EC] rounded-md order-search focus:border-2 focus:outline-none focus:border-brand focus:text-brand-muted"
          />
        </form>
        */}
      </div>
      <div className="order-list-table-wrapper">
        <Table
          className="order-list-table"
          columns={columns}
          data={filterData}
          rowKey="$id"
          scroll={{ x: 750 }}
        />
      </div>
      {!value.trim() && (
        <div className="mt-5 ltr:text-right rtl:text-left">
          <Pagination
            current={currentPage}
            onChange={updatePage}
            pageSize={countPerPage}
            total={orders?.length}
            prevIcon={<GrPrevious size={12} style={{ color: '#090B17' }} />}
            nextIcon={<GrNext size={12} style={{ color: '#090B17' }} />}
            className="order-table-pagination"
          />
        </div>
      )}
    </>
  );
};

export default OrderTable;
