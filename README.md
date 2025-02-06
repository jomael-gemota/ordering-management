# Ordering Management

## Invoice Audit MongoDB Schema

### PO Details Schema
{
    brand: "DVS",
    segment: "active",
    poNumber: "FDVS120424MOD",
    listingDataItems: ["DVF-DVF0000029_985_9.5M"],
    ocItems: ["DVF-DVF0000029_985_9.5M"],
    invoiceItems: [],
    poUploadItems: [],
}

### Products Schema
{
    poNumber: "FDVS120424MOD",
    itemType: "listing-data",
    sku: "DVF-DVF0000029_985_9.5M",
    upc: "045269185709",
    asin: "B07F46SKMP",
    title: "DVS Men's Comanche Skate Shoe, Black Reflective Charcoal New Black, 9.5",
    itemCost: 45.00,
    dicCost: 42.50,
    qty: 10,
    total: 427.50,
},
{
    poNumber: "FDVS120424MOD",
    itemType: "order-confirmation",
    sku: "DVF-DVF0000029_985_9.5M",
    upc: "045269185709",
    asin: "B07F46SKMP",
    title: "DVS Men's Comanche Skate Shoe, Black Reflective Charcoal New Black, 9.5",
    itemCost: 45.00,
    dicCost: 42.50,
    qty: 10,
    total: 427.50,
},