export default `<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kitchen Order Slip</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&family=Roboto+Mono:wght@500&display=swap');

    body {
      font-family: 'Roboto Condensed', sans-serif;
      margin: 0;
      padding: 2px;
      width: 72mm; /* Standard thermal receipt width */
      font-size: 10px;
      line-height: 1.1;
      background-color: white;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }

    .kot-container {
      border: 1px solid #222;
      padding: 4px;
      border-radius: 1px;
    }

    .header {
      text-align: center;
      padding: 4px 0;
      margin-bottom: 2px;
      position: relative;
    }

    .header-title {
      font-weight: 700;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: inline-block;
      padding: 2px 6px;
      background-color: #222;
      color: white;
      border-radius: 2px;
    }

    .priority-marker {
      position: absolute;
      right: 0;
      top: 3px;
      background-color: #e74c3c;
      color: white;
      font-weight: 700;
      padding: 1px 4px;
      font-size: 7px;
      border-radius: 8px;
      text-transform: uppercase;
    }

    .order-info {
      display: flex;
      justify-content: space-between;
      margin: 2px 0;
      padding: 3px 0;
      border-top: 1px dashed #444;
      border-bottom: 1px dashed #444;
      font-family: 'Roboto Mono', monospace;
      font-size: 9px;
    }

    .order-info div {
      width: 50%;
    }

    .order-type-section {
      margin: 4px 0;
      padding: 3px;
      background-color: #f5f5f5;
      border-left: 3px solid #222;
      font-size: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 5px;
    }

    th {
      text-align: left;
      padding: 3px 2px;
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      border-bottom: 1px solid #222;
    }

    td {
      padding: 3px 2px;
      border-bottom: 1px dotted #ccc;
      font-size: 10px;
    }

    .qty-col {
      text-align: center;
      font-weight: 700;
      font-size: 12px;
    }

    .item-name {
      font-weight: 700;
      font-size: 11px;
    }

    .item-modifier {
      font-size: 8px;
      font-style: italic;
      padding-left: 4px;
      color: #444;
    }

    .bold {
      font-weight: 700;
    }

    .centered {
      text-align: center;
    }

    .header-row {
      background-color: #222;
      color: white;
    }

    .footer {
      margin-top: 5px;
      text-align: center;
      font-size: 8px;
      padding-top: 3px;
      border-top: 1px dashed #444;
    }

    .timestamp {
      font-family: 'Roboto Mono', monospace;
      font-size: 7px;
      color: #666;
      margin-top: 2px;
    }

    .ticket-number {
      font-family: 'Roboto Mono', monospace;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin: 2px 0;
    }
    
    .modifiers {
      font-size: 8px;
      font-style: italic;
      padding-left: 5px;
      color: #444;
    }

    .kot-container, table, .header, .order-info, .order-type-section, .footer {
      page-break-inside: avoid;
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
        <div><span class="bold">ORDER #:</span> {{orderNumber}}</div>
        <div><span class="bold">KOT #:</span> 1</div>
        <div><span class="bold">TABLE:</span> ----</div>
      </div>
      <div>
        <div><span class="bold">DATE:</span> {{currentDate}}</div>
        <div><span class="bold">TIME:</span> {{currentTime}}</div>
        <div><span class="bold">CHEF:</span> Kitchen 1</div>
      </div>
    </div>

    <div class="order-type-section">
      <div><span class="bold">TYPE:</span> {{orderType}}</div>
      <div><span class="bold">STAFF:</span> General</div>
    </div>

    <table>
      <thead>
        <tr class="header-row">
          <th>ITEM DESCRIPTION</th>
          <th style="text-align: center; width: 40px;">QTY</th>
        </tr>
      </thead>
      <tbody>
        {{itemsList}}
      </tbody>
    </table>

    <div class="footer">
      <div>PREPARE IMMEDIATELY</div>
  </div>

  <script>
    window.onload = function() {
      window.print();
      setTimeout(() => window.close(), 2000); 
    }
  </script>
</body>
</html>`;