export default `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Delivery Slip</title>
  <style>
    @page {
      size: 72mm auto;
      margin: 0;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, sans-serif;
      width: 72mm;
      max-width: 72mm;
      font-size: 10px;
      line-height: 1.1;
      background-color: white;
      font-weight: bold;
      margin: 5px;
      padding: 0;
    }

    @media print {
      body {
        width: 72mm;
        margin: 0 !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      
      * {
        font-weight: bold !important;
      }
    }

    .slip-container {
      // border: 1px solid #000;
      width: 100%;
      overflow: hidden;
      padding: 5px 0; /* Added padding top and bottom */
    }

    .header {
      text-align: center;
      padding: 2px 0;
      position: relative;
      margin-bottom: 5px; /* Added margin for space between title and fields */
    }

    .header-title {
      font-weight: 900;
      font-size: 14px;
      text-transform: uppercase;
      display: inline-block;
      padding: 2px 6px;
      background-color: #000;
      color: white;
    }

    .order-info {
      display: flex;
      justify-content: space-between;
      border-top: 1px dashed #000;
      border-bottom: 1px dashed #000;
      font-size: 9px;
      padding: 4px 2px;
    }

    .order-info div {
      width: 50%;
    }
    
    .order-info .right-align {
      text-align: left;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 5px;
    }

    th {
      text-align: left;
      padding: 2px;
      font-size: 9px;
      text-transform: uppercase;
      border-bottom: 1px solid #000;
      font-weight: 900;
    }

    td {
      padding: 2px;
      border-bottom: 1px dotted #000;
      font-size: 11px;
    }

    .qty-col {
      text-align: center;
      font-weight: 900;
      font-size: 12px;
    }

    .item-name {
      font-weight: 900;
      font-size: 11px;
    }

    .item-modifier {
      font-size: 9px;
      font-style: italic;
      padding-left: 3px;
      color: #000;
    }

    .header-row {
      background-color: #000;
      color: white;
    }

    .footer {
      text-align: center;
      font-size: 9px;
      font-weight: 900;
      padding: 4px 0;
      border-top: 1px dashed #000;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <div class="slip-container">
    <div class="header">
      <div class="header-title">DELIVERY SLIP</div>
    </div>

    <div class="order-info">
      <div>
        <div>ORDER #: {{orderNumber}}</div>
        <div>TABLE #: ----</div>
      </div>
      <div class="right-align">
        <div><span class="bold">DATE:</span> {{currentDate}}</div>
        <div><span class="bold">TIME:</span> {{currentTime}}</div>
        <div>WAITER: General</div>
      </div>
    </div>

    <table>
      <thead>
        <tr class="header-row">
          <th>DESCRIPTION</th>
          <th style="text-align: center; width: 32px;">QTY</th>
        </tr>
      </thead>
      <tbody>
        {{itemsList}}
      </tbody>
    </table>

    <div class="footer">
      <div>PREPARE IMMEDIATELY</div>
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