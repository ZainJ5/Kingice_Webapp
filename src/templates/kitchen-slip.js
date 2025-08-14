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
      padding: 6px;
      width: 72mm; /* Standard thermal receipt width */
      font-size: 10px;
      line-height: 1.3;
      background-color: white;
    }

    .kot-container {
      border: 1.5px solid #222;
      padding: 8px;
      border-radius: 2px;
    }

    .header {
      text-align: center;
      padding: 8px 0;
      margin-bottom: 5px;
      position: relative;
    }

    .header-title {
      font-weight: 700;
      font-size: 16px;
      text-transform: uppercase;
      letter-spacing: 1px;
      display: inline-block;
      padding: 3px 10px;
      background-color: #222;
      color: white;
      border-radius: 4px;
    }

    .priority-marker {
      position: absolute;
      right: 0;
      top: 5px;
      background-color: #e74c3c;
      color: white;
      font-weight: 700;
      padding: 2px 6px;
      font-size: 8px;
      border-radius: 10px;
      text-transform: uppercase;
    }

    .order-info {
      display: flex;
      justify-content: space-between;
      margin: 5px 0;
      padding: 6px 0;
      border-top: 1px dashed #444;
      border-bottom: 1px dashed #444;
      font-family: 'Roboto Mono', monospace;
    }

    .order-info div {
      width: 50%;
    }

    .order-type-section {
      margin: 8px 0;
      padding: 5px;
      background-color: #f5f5f5;
      border-left: 4px solid #222;
      font-size: 11px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }

    th {
      text-align: left;
      padding: 6px 4px;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #222;
    }

    td {
      padding: 6px 4px;
      border-bottom: 1px dotted #ccc;
      font-size: 11px;
    }

    .qty-col {
      text-align: center;
      font-weight: 700;
      font-size: 13px;
    }

    .item-name {
      font-weight: 700;
      font-size: 12px;
    }

    .item-modifier {
      font-size: 9px;
      font-style: italic;
      padding-left: 8px;
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
      margin-top: 10px;
      text-align: center;
      font-size: 9px;
      padding-top: 5px;
      border-top: 1px dashed #444;
    }

    .timestamp {
      font-family: 'Roboto Mono', monospace;
      font-size: 8px;
      color: #666;
      margin-top: 5px;
    }

    .ticket-number {
      font-family: 'Roboto Mono', monospace;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 1px;
      margin: 5px 0;
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
      <div class="timestamp">Printed: {{currentDate}} {{currentTime}} by ZainJ5</div>
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