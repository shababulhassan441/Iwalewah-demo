import RCPagination, { PaginationProps } from 'rc-pagination';
import 'rc-pagination/assets/index.css';

const Pagination: React.FC<PaginationProps> = (props) => {
  // Cast RCPagination as any to avoid TypeScript JSX type issues
  const RCPaginationComponent = RCPagination as any;
  
  return <RCPaginationComponent {...props} />;
};

export default Pagination;
