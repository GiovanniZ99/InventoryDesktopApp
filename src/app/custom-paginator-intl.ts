import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class CustomPaginatorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel: string = '';

  // You can optionally customize other labels here as well
  // override nextPageLabel: string = 'Next page custom';
  // override previousPageLabel: string = 'Previous page custom';
  // override firstPageLabel: string = 'First page custom';
  // override lastPageLabel: string = 'Last page custom';
  
  // override getRangeLabel = (page: number, pageSize: number, length: number) => {
  //   if (length === 0) { return `Page 1 of 1`; }
  //   const amountPages = Math.ceil(length / pageSize);
  //   return `Page ${page + 1} of ${amountPages}`;
  // };
} 