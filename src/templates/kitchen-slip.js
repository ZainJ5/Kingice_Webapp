export default `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kitchen Order Slip</title>
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
      margin: 0;
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

    .kot-container {
      border: 1px solid #000;
      width: 100%;
      overflow: hidden;
    }

    .header {
      text-align: center;
      padding: 2px 0;
      position: relative;
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

    .priority-marker {
      position: absolute;
      right: 2px;
      top: 2px;
      background-color: #ff0000;
      color: white;
      font-weight: 900;
      padding: 1px 4px;
      font-size: 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .order-info {
      display: flex;
      justify-content: space-between;
      border-top: 1px dashed #000;
      border-bottom: 1px dashed #000;
      font-size: 9px;
      padding: 2px 1px;
    }

    .order-info div {
      width: 50%;
    }

    .order-type-section {
      padding: 2px;
      background-color: #e6e6e6;
      border-left: 3px solid #000;
      font-size: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
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

    .centered {
      text-align: center;
    }

    .header-row {
      background-color: #000;
      color: white;
    }

    .footer {
      text-align: center;
      font-size: 9px;
      font-weight: 900;
      padding: 2px 0;
      border-top: 1px dashed #000;
    }

    .ticket-number {
      font-size: 14px;
      font-weight: 900;
      margin: 2px 0;
    }
    
    .user-info {
      font-size: 8px;
      text-align: center;
      padding-top: 1px;
    }
  </style>
</head>
<body>
  <div class="kot-container">
    <div class="header">
      <div class="header-title">KITCHEN ORDER</div>
      <div class="priority-marker">PRIORITY</div>
    </div>

    <div class="ticket-number centered">
      TICKET #: {{ticketNumber}}
    </div>

    <div class="order-info">
      <div>
        <div>ORDER #: {{orderNumber}}</div>
        <div>KOT #: 1</div>
        <div>TABLE: ----</div>
      </div>
      <div>
        <div>DATE: 2025-08-26</div>
        <div>TIME: 20:15:09</div>
        <div>CHEF: Kitchen 1</div>
      </div>
    </div>

    <div class="order-type-section">
      <div>TYPE: {{orderType}}</div>
      <div>STAFF: General</div>
    </div>

    <table>
      <thead>
        <tr class="header-row">
          <th>ITEM DESCRIPTION</th>
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