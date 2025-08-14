export default `<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Delivery Payment Receipt</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Open+Sans:wght@400;600&display=swap');

    body {
      font-family: 'Open Sans', sans-serif;
      margin: 0;
      padding: 8px;
      width: 72mm; /* Standard thermal receipt width */
      font-size: 9px;
      line-height: 1.4;
      color: #333;
    }

    .receipt-container {
      border: 1px solid #ddd;
      padding: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .header {
      text-align: center;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px dashed #ccc;
    }

    .restaurant-name {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 14px;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }

    .restaurant-info {
      font-size: 8px;
      color: #555;
    }

    .title-container {
      margin: 10px 0;
      text-align: center;
    }

    .receipt-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 12px;
      font-weight: 700;
      color: white;
      background-color: #222;
      padding: 6px 0;
      letter-spacing: 1px;
      border-radius: 3px;
      text-transform: uppercase;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .order-details {
      display: flex;
      justify-content: space-between;
      margin: 8px 0;
      padding: 6px 0;
      border-bottom: 1px solid #eee;
    }

    .order-details div {
      margin: 2px 0;
    }

    .section-title {
      font-family: 'Montserrat', sans-serif;
      font-weight: 600;
      font-size: 9px;
      margin-top: 8px;
      margin-bottom: 4px;
      color: #222;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0;
      font-size: 8px;
    }

    th {
      font-weight: 600;
      text-align: left;
      padding: 4px 2px;
      border-bottom: 1px solid #ddd;
      text-transform: uppercase;
      font-size: 7px;
      color: #555;
    }

    td {
      padding: 3px 2px;
      border-bottom: 1px dotted #eee;
    }

    .item-count {
      margin: 6px 0;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
    }

    .summary {
      margin-top: 8px;
      text-align: right;
    }

    .summary div {
      margin: 3px 0;
    }

    .bill-amount {
      background-color: #222;
      color: #fff;
      padding: 6px;
      margin-top: 5px;
      border-radius: 3px;
      font-size: 10px;
      font-family: 'Montserrat', sans-serif;
    }

    .payment-info {
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px dashed #ccc;
    }

    .payment-method {
      font-weight: 600;
      margin-bottom: 6px;
    }

    .payment-details {
      display: flex;
      justify-content: space-between;
      margin-top: 4px;
    }

    .customer-info {
      margin-top: 10px;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 3px;
      background-color: #f9f9f9;
    }

    .bold {
      font-weight: 600;
      color: #222;
    }

    .text-right {
      text-align: right;
    }

    .footer {
      margin-top: 10px;
      text-align: center;
      font-size: 8px;
      font-style: italic;
      color: #777;
      padding-top: 6px;
      border-top: 1px dashed #ccc;
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <div class="restaurant-name">KING ICE FAST FOOD</div>
      <div class="restaurant-info">Landhi 3 1/2 SNTN 5609626-7</div>
      <div class="restaurant-info">All Prices Are Inclusive of 13% SST</div>
    </div>

    <div class="title-container">
      <div class="receipt-title">DELIVERY - PAYMENT RECEIPT</div>
    </div>

    <div class="order-details">
      <div>
        <div><span class="bold">ORDER #: </span>{{orderNumber}}</div>
        <div><span class="bold">TYPE: </span>{{orderType}}</div>
        <div><span class="bold">Customer: </span>{{customerName}}</div>
        <div><span class="bold">Cashier: </span>POS</div>
      </div>
      <div>
        <div><span class="bold">Date: </span>{{currentDate}}</div>
        <div><span class="bold">Time: </span>{{currentTime}}</div>
        <div><span class="bold">Rider: </span>General</div>
        <div><span class="bold">Covers: </span>1</div>
      </div>
    </div>

    <div class="section-title">ORDER ITEMS</div>
    <table>
      <thead>
        <tr>
          <th>Sr.#</th>
          <th>Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Rate</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        {{itemRows}}
      </tbody>
    </table>

    <div class="item-count">
      <div><span class="bold">Item(s): </span>{{itemCount}}</div>
      <div><span class="bold">Gross Amount: </span>{{subtotal}}</div>
    </div>

    <div class="summary">
      <div><span class="bold">Delivery Charges: </span>{{deliveryFee}}</div>
      <div><span class="bold">Tip Amount: </span>0</div>
      <div class="bill-amount">
        <span class="bold">BILL AMOUNT: </span>{{total}}
      </div>
    </div>

    <div class="payment-info">
      <div class="payment-method"><span class="bold">Payment Method: </span>{{paymentMethod}}</div>
      <div class="payment-details">
        <div><span class="bold">Customer Paid: </span>{{total}}.00</div>
        <div><span class="bold">Change Return: </span>{{changeRequest}}</div>
      </div>
    </div>

    <div class="customer-info">
      <div><span class="bold">Customer Name & Contact: </span>{{customerName}}</div>
      <div>{{mobileNumber}}</div>
      <div><span class="bold">Complete Address: </span>{{deliveryAddress}}</div>
      <div><span class="bold">Instruction: </span>{{paymentInstructions}}</div>
    </div>

    <div class="footer">
      Thank you for choosing King Ice Fast Food!
      <br>We appreciate your business
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
      setTimeout(() => window.close(), 500);
    }
  </script>
</body>
</html>`;