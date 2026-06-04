const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const passwordHash =
  "$2a$10$demoSeedPasswordHashForLocalDevelopmentOnlyDoNotUseInProduction";

const day = 24 * 60 * 60 * 1000;
const now = new Date();
const addDays = (days) => new Date(now.getTime() + days * day);
const dateOnly = (days) => {
  const date = addDays(days);
  date.setHours(0, 0, 0, 0);
  return date;
};

async function seedCarModels() {
  const models = [
    {
      name: "Astra Prime",
      type: "Sedan",
      price: "1450000.00",
      engineCc: 1498,
      bhp: 121,
      torque: "145 Nm",
      fuelType: "Petrol",
      mileage: "18.2 km/l",
      rangeKm: null,
      colorsAvailable: ["Pearl White", "Graphite Grey", "Midnight Blue"],
      features: ["ADAS Level 1", "Ventilated seats", "Wireless charging"],
      imageUrls: [
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d",
      ],
    },
    {
      name: "Terra X",
      type: "SUV",
      price: "2150000.00",
      engineCc: 1997,
      bhp: 168,
      torque: "350 Nm",
      fuelType: "Diesel",
      mileage: "15.8 km/l",
      rangeKm: null,
      colorsAvailable: ["Forest Green", "Pearl White", "Obsidian Black"],
      features: ["4x4 drive", "Panoramic sunroof", "Hill descent control"],
      imageUrls: [
        "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b",
      ],
    },
    {
      name: "Volt E1",
      type: "EV",
      price: "1890000.00",
      engineCc: 0,
      bhp: 154,
      torque: "310 Nm",
      fuelType: "Electric",
      mileage: "6.1 km/kWh",
      rangeKm: 470,
      colorsAvailable: ["Arctic Silver", "Electric Blue", "Pearl White"],
      features: ["Fast charging", "Vehicle-to-load", "Connected car suite"],
      imageUrls: [
        "https://images.unsplash.com/photo-1593941707882-a5bba14938c7",
      ],
    },
    {
      name: "Nova Hybrid",
      type: "Hybrid",
      price: "1725000.00",
      engineCc: 1490,
      bhp: 115,
      torque: "141 Nm",
      fuelType: "Hybrid",
      mileage: "27.5 km/l",
      rangeKm: null,
      colorsAvailable: ["Champagne Gold", "Ruby Red", "Graphite Grey"],
      features: ["Strong hybrid system", "Drive modes", "Head-up display"],
      imageUrls: [
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
      ],
    },
  ];

  return Promise.all(
    models.map((model) =>
      prisma.carModel.upsert({
        where: { name: model.name },
        update: model,
        create: model,
      })
    )
  );
}

async function seedShowrooms() {
  const showrooms = [
    {
      id: "seed-showroom-mumbai",
      name: "Vaibhav Cars Mumbai Central",
      city: "Mumbai",
      address: "21 Marine Lines Road, Mumbai",
      pincode: "400020",
      phone: "+91-9876500101",
      email: "mumbai@vaibhavcars.example",
      googleMapsUrl: "https://maps.example.com/vaibhav-cars-mumbai",
    },
    {
      id: "seed-showroom-pune",
      name: "Vaibhav Cars Pune West",
      city: "Pune",
      address: "88 Baner Road, Pune",
      pincode: "411045",
      phone: "+91-9876500102",
      email: "pune@vaibhavcars.example",
      googleMapsUrl: "https://maps.example.com/vaibhav-cars-pune",
    },
  ];

  return Promise.all(
    showrooms.map((showroom) =>
      prisma.showroom.upsert({
        where: { id: showroom.id },
        update: showroom,
        create: showroom,
      })
    )
  );
}

async function seedEmployees(showrooms) {
  const [mumbai, pune] = showrooms;
  const employees = [
    {
      id: "seed-employee-admin",
      name: "Aarav Mehta",
      email: "aarav.mehta@vaibhavcars.example",
      phone: "+91-9000000001",
      employeeCode: "VC-ADM-001",
      role: "Admin",
      department: "Operations",
      showroomId: mumbai.id,
      salary: "125000.00",
      joiningDate: dateOnly(-900),
      passwordHash,
      performanceScore: "96.50",
    },
    {
      id: "seed-employee-manager",
      name: "Priya Nair",
      email: "priya.nair@vaibhavcars.example",
      phone: "+91-9000000002",
      employeeCode: "VC-MGR-001",
      role: "ShowroomManager",
      department: "Sales",
      showroomId: mumbai.id,
      salary: "98000.00",
      joiningDate: dateOnly(-720),
      passwordHash,
      performanceScore: "91.25",
    },
    {
      id: "seed-employee-sales",
      name: "Kabir Shah",
      email: "kabir.shah@vaibhavcars.example",
      phone: "+91-9000000003",
      employeeCode: "VC-SAL-001",
      role: "SalesExecutive",
      department: "Sales",
      showroomId: mumbai.id,
      salary: "52000.00",
      joiningDate: dateOnly(-420),
      passwordHash,
      performanceScore: "88.00",
    },
    {
      id: "seed-employee-service",
      name: "Neha Kulkarni",
      email: "neha.kulkarni@vaibhavcars.example",
      phone: "+91-9000000004",
      employeeCode: "VC-SRV-001",
      role: "ServiceStaff",
      department: "Service",
      showroomId: pune.id,
      salary: "46000.00",
      joiningDate: dateOnly(-360),
      passwordHash,
      performanceScore: "84.75",
    },
    {
      id: "seed-employee-support",
      name: "Rohan Desai",
      email: "rohan.desai@vaibhavcars.example",
      phone: "+91-9000000005",
      employeeCode: "VC-SUP-001",
      role: "SupportAgent",
      department: "Customer Support",
      showroomId: pune.id,
      salary: "41000.00",
      joiningDate: dateOnly(-250),
      passwordHash,
      performanceScore: "82.00",
    },
  ];

  const created = await Promise.all(
    employees.map((employee) =>
      prisma.employee.upsert({
        where: { employeeCode: employee.employeeCode },
        update: employee,
        create: employee,
      })
    )
  );

  await prisma.showroom.update({
    where: { id: mumbai.id },
    data: { managerId: "seed-employee-manager" },
  });

  return created;
}

async function seedCustomers() {
  const customers = [
    {
      id: "seed-customer-isha",
      name: "Isha Kapoor",
      email: "isha.kapoor@example.com",
      phone: "+91-8000000001",
      city: "Mumbai",
      passwordHash,
      profilePhotoUrl: "https://i.pravatar.cc/160?img=32",
      loyaltyPoints: 2450,
      referralCode: "ISHA2026",
      tag: "VIP",
      lastLogin: addDays(-2),
    },
    {
      id: "seed-customer-vikram",
      name: "Vikram Rao",
      email: "vikram.rao@example.com",
      phone: "+91-8000000002",
      city: "Pune",
      passwordHash,
      profilePhotoUrl: "https://i.pravatar.cc/160?img=12",
      loyaltyPoints: 820,
      referralCode: "VIKRAM2026",
      referredById: "seed-customer-isha",
      tag: "Regular",
      lastLogin: addDays(-7),
    },
    {
      id: "seed-customer-fatima",
      name: "Fatima Khan",
      email: "fatima.khan@example.com",
      phone: "+91-8000000003",
      city: "Mumbai",
      passwordHash,
      profilePhotoUrl: "https://i.pravatar.cc/160?img=47",
      loyaltyPoints: 120,
      referralCode: "FATIMA2026",
      tag: "ColdLead",
      lastLogin: addDays(-18),
    },
  ];

  const created = [];
  for (const customer of customers) {
    created.push(
      await prisma.customer.upsert({
        where: { email: customer.email },
        update: customer,
        create: customer,
      })
    );
  }

  return created;
}

async function seedInventory(carModels, showrooms) {
  const [astra, terra, volt, nova] = carModels;
  const [mumbai, pune] = showrooms;
  const inventory = [
    {
      id: "seed-inventory-astra-white",
      carModelId: astra.id,
      showroomId: mumbai.id,
      color: "Pearl White",
      vin: "VCVINASTRA000001",
      status: "Sold",
      arrivalDate: dateOnly(-55),
      soldDate: dateOnly(-14),
    },
    {
      id: "seed-inventory-terra-green",
      carModelId: terra.id,
      showroomId: mumbai.id,
      color: "Forest Green",
      vin: "VCVINTERRA000001",
      status: "Available",
      arrivalDate: dateOnly(-20),
    },
    {
      id: "seed-inventory-volt-blue",
      carModelId: volt.id,
      showroomId: pune.id,
      color: "Electric Blue",
      vin: "VCVINVOLT000001",
      status: "Reserved",
      arrivalDate: dateOnly(-12),
    },
    {
      id: "seed-inventory-nova-gold",
      carModelId: nova.id,
      showroomId: pune.id,
      color: "Champagne Gold",
      vin: "VCVINNOVA000001",
      status: "Available",
      arrivalDate: dateOnly(-8),
    },
  ];

  return Promise.all(
    inventory.map((item) =>
      prisma.carInventory.upsert({
        where: { vin: item.vin },
        update: item,
        create: item,
      })
    )
  );
}

async function main() {
  const carModels = await seedCarModels();
  const showrooms = await seedShowrooms();
  const employees = await seedEmployees(showrooms);
  const customers = await seedCustomers();
  const inventory = await seedInventory(carModels, showrooms);

  const [astra, terra, volt, nova] = carModels;
  const [mumbai, pune] = showrooms;
  const [, manager, sales, service, support] = employees;
  const [isha, vikram, fatima] = customers;
  const [soldAstra, availableTerra, reservedVolt] = inventory;

  const configuration = await prisma.carConfiguration.upsert({
    where: { id: "seed-config-isha-astra" },
    update: {
      customerId: isha.id,
      carModelId: astra.id,
      selectedColor: "Pearl White",
      interiorType: "Tan leather",
      addons: ["Dash camera", "Ceramic coating", "Premium mats"],
      basePrice: "1450000.00",
      addonsPrice: "85000.00",
      gst: "275400.00",
      totalPrice: "1810400.00",
      financeType: "Loan",
      loanTenure: 60,
      loanRate: "8.75",
      emiAmount: "29870.00",
      status: "Converted",
    },
    create: {
      id: "seed-config-isha-astra",
      customerId: isha.id,
      carModelId: astra.id,
      selectedColor: "Pearl White",
      interiorType: "Tan leather",
      addons: ["Dash camera", "Ceramic coating", "Premium mats"],
      basePrice: "1450000.00",
      addonsPrice: "85000.00",
      gst: "275400.00",
      totalPrice: "1810400.00",
      financeType: "Loan",
      loanTenure: 60,
      loanRate: "8.75",
      emiAmount: "29870.00",
      status: "Converted",
    },
  });

  const purchase = await prisma.purchase.upsert({
    where: { invoiceNumber: "VC-INV-2026-0001" },
    update: {
      customerId: isha.id,
      carInventoryId: soldAstra.id,
      carConfigurationId: configuration.id,
      employeeId: sales.id,
      showroomId: mumbai.id,
      purchaseDate: dateOnly(-14),
      exShowroomPrice: "1450000.00",
      rtoCharges: "142000.00",
      insuranceAmount: "68000.00",
      accessoriesCost: "85000.00",
      gstAmount: "275400.00",
      totalAmount: "1810400.00",
      paymentType: "Loan",
      loanAmount: "1250000.00",
      loanTenure: 60,
      loanRate: "8.75",
      emiAmount: "29870.00",
      deliveryDate: dateOnly(-10),
      invoicePdfUrl: "https://cdn.example.com/invoices/VC-INV-2026-0001.pdf",
    },
    create: {
      id: "seed-purchase-isha-astra",
      customerId: isha.id,
      carInventoryId: soldAstra.id,
      carConfigurationId: configuration.id,
      employeeId: sales.id,
      showroomId: mumbai.id,
      invoiceNumber: "VC-INV-2026-0001",
      purchaseDate: dateOnly(-14),
      exShowroomPrice: "1450000.00",
      rtoCharges: "142000.00",
      insuranceAmount: "68000.00",
      accessoriesCost: "85000.00",
      gstAmount: "275400.00",
      totalAmount: "1810400.00",
      paymentType: "Loan",
      loanAmount: "1250000.00",
      loanTenure: 60,
      loanRate: "8.75",
      emiAmount: "29870.00",
      deliveryDate: dateOnly(-10),
      invoicePdfUrl: "https://cdn.example.com/invoices/VC-INV-2026-0001.pdf",
    },
  });

  const customerVehicle = await prisma.customerVehicle.upsert({
    where: { vin: "VCVINASTRA000001" },
    update: {
      customerId: isha.id,
      carModelId: astra.id,
      registrationNumber: "MH01VC2601",
      purchaseDate: dateOnly(-14),
      purchasePrice: "1810400.00",
      insuranceCompany: "SecureDrive Insurance",
      insuranceExpiry: dateOnly(351),
      nextServiceDue: dateOnly(80),
      color: "Pearl White",
    },
    create: {
      id: "seed-vehicle-isha-astra",
      customerId: isha.id,
      carModelId: astra.id,
      vin: "VCVINASTRA000001",
      registrationNumber: "MH01VC2601",
      purchaseDate: dateOnly(-14),
      purchasePrice: "1810400.00",
      insuranceCompany: "SecureDrive Insurance",
      insuranceExpiry: dateOnly(351),
      nextServiceDue: dateOnly(80),
      color: "Pearl White",
    },
  });

  await prisma.emiPayment.upsert({
    where: {
      purchaseId_monthNumber: {
        purchaseId: purchase.id,
        monthNumber: 1,
      },
    },
    update: {
      customerId: isha.id,
      dueDate: dateOnly(16),
      principalAmount: "20755.00",
      interestAmount: "9115.00",
      emiAmount: "29870.00",
      balanceRemaining: "1229245.00",
      status: "Due",
    },
    create: {
      id: "seed-emi-isha-astra-1",
      purchaseId: purchase.id,
      customerId: isha.id,
      monthNumber: 1,
      dueDate: dateOnly(16),
      principalAmount: "20755.00",
      interestAmount: "9115.00",
      emiAmount: "29870.00",
      balanceRemaining: "1229245.00",
      status: "Due",
    },
  });

  await prisma.testDriveBooking.upsert({
    where: { id: "seed-test-drive-vikram-terra" },
    update: {
      customerId: vikram.id,
      carModelId: terra.id,
      showroomId: mumbai.id,
      employeeId: sales.id,
      bookingDate: dateOnly(3),
      timeSlot: "11:00 AM - 12:00 PM",
      status: "Scheduled",
    },
    create: {
      id: "seed-test-drive-vikram-terra",
      customerId: vikram.id,
      carModelId: terra.id,
      showroomId: mumbai.id,
      employeeId: sales.id,
      bookingDate: dateOnly(3),
      timeSlot: "11:00 AM - 12:00 PM",
      status: "Scheduled",
    },
  });

  const serviceBooking = await prisma.serviceBooking.upsert({
    where: { id: "seed-service-isha-astra" },
    update: {
      customerId: isha.id,
      customerVehicleId: customerVehicle.id,
      showroomId: pune.id,
      mechanicId: service.id,
      serviceType: "First inspection",
      description: "Initial 1,000 km inspection with wash and fluid check.",
      bookingDate: dateOnly(5),
      timeSlot: "02:00 PM - 04:00 PM",
      status: "Booked",
      estimatedCost: "0.00",
    },
    create: {
      id: "seed-service-isha-astra",
      customerId: isha.id,
      customerVehicleId: customerVehicle.id,
      showroomId: pune.id,
      mechanicId: service.id,
      serviceType: "First inspection",
      description: "Initial 1,000 km inspection with wash and fluid check.",
      bookingDate: dateOnly(5),
      timeSlot: "02:00 PM - 04:00 PM",
      status: "Booked",
      estimatedCost: "0.00",
    },
  });

  await prisma.serviceJobItem.upsert({
    where: { id: "seed-service-item-inspection" },
    update: {
      serviceBookingId: serviceBooking.id,
      itemDescription: "General inspection labour",
      itemType: "Labour",
      quantity: 1,
      unitPrice: "0.00",
      totalPrice: "0.00",
    },
    create: {
      id: "seed-service-item-inspection",
      serviceBookingId: serviceBooking.id,
      itemDescription: "General inspection labour",
      itemType: "Labour",
      quantity: 1,
      unitPrice: "0.00",
      totalPrice: "0.00",
    },
  });

  const lead = await prisma.lead.upsert({
    where: { id: "seed-lead-fatima-volt" },
    update: {
      customerId: fatima.id,
      assignedToId: sales.id,
      carModelId: volt.id,
      source: "Online",
      budgetMin: "1600000.00",
      budgetMax: "2000000.00",
      stage: "Negotiation",
      priority: "Hot",
      notes: "Interested in EV exchange bonus and fast-charger availability.",
      followUpDate: dateOnly(1),
      score: 86,
    },
    create: {
      id: "seed-lead-fatima-volt",
      customerId: fatima.id,
      assignedToId: sales.id,
      carModelId: volt.id,
      source: "Online",
      budgetMin: "1600000.00",
      budgetMax: "2000000.00",
      stage: "Negotiation",
      priority: "Hot",
      notes: "Interested in EV exchange bonus and fast-charger availability.",
      followUpDate: dateOnly(1),
      score: 86,
    },
  });

  await prisma.leadInteraction.upsert({
    where: { id: "seed-lead-interaction-fatima-1" },
    update: {
      leadId: lead.id,
      employeeId: sales.id,
      interactionType: "WhatsApp",
      notes: "Shared quote and charging plan details.",
      nextAction: "Confirm exchange vehicle valuation.",
    },
    create: {
      id: "seed-lead-interaction-fatima-1",
      leadId: lead.id,
      employeeId: sales.id,
      interactionType: "WhatsApp",
      notes: "Shared quote and charging plan details.",
      nextAction: "Confirm exchange vehicle valuation.",
    },
  });

  const ticket = await prisma.supportTicket.upsert({
    where: { ticketNumber: "VC-TKT-2026-0001" },
    update: {
      customerId: isha.id,
      assignedToId: support.id,
      issueType: "DeliveryDelay",
      priority: "Normal",
      status: "InProgress",
      sentiment: "Neutral",
      channel: "Web",
      slaDeadline: addDays(1),
    },
    create: {
      id: "seed-ticket-isha-delivery",
      customerId: isha.id,
      assignedToId: support.id,
      ticketNumber: "VC-TKT-2026-0001",
      issueType: "DeliveryDelay",
      priority: "Normal",
      status: "InProgress",
      sentiment: "Neutral",
      channel: "Web",
      slaDeadline: addDays(1),
    },
  });

  await prisma.ticketMessage.upsert({
    where: { id: "seed-ticket-message-isha-1" },
    update: {
      ticketId: ticket.id,
      senderId: isha.id,
      senderType: "Customer",
      message: "Please confirm the permanent registration delivery timeline.",
      attachments: [],
    },
    create: {
      id: "seed-ticket-message-isha-1",
      ticketId: ticket.id,
      senderId: isha.id,
      senderType: "Customer",
      message: "Please confirm the permanent registration delivery timeline.",
      attachments: [],
    },
  });

  await Promise.all([
    prisma.showroomTarget.upsert({
      where: {
        showroomId_month_year: {
          showroomId: mumbai.id,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
      },
      update: {
        salesTarget: 42,
        revenueTarget: "78000000.00",
        salesAchieved: 18,
        revenueAchieved: "33250000.00",
      },
      create: {
        id: "seed-target-showroom-mumbai-current",
        showroomId: mumbai.id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        salesTarget: 42,
        revenueTarget: "78000000.00",
        salesAchieved: 18,
        revenueAchieved: "33250000.00",
      },
    }),
    prisma.employeeTarget.upsert({
      where: {
        employeeId_month_year: {
          employeeId: sales.id,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
      },
      update: {
        salesTarget: 12,
        revenueTarget: "22000000.00",
        salesAchieved: 6,
        revenueAchieved: "10400000.00",
        commissionEarned: "52000.00",
      },
      create: {
        id: "seed-target-sales-current",
        employeeId: sales.id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        salesTarget: 12,
        revenueTarget: "22000000.00",
        salesAchieved: 6,
        revenueAchieved: "10400000.00",
        commissionEarned: "52000.00",
      },
    }),
    prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: sales.id,
          date: dateOnly(0),
        },
      },
      update: {
        checkIn: new Date(dateOnly(0).getTime() + 9 * 60 * 60 * 1000),
        checkOut: null,
        status: "Present",
      },
      create: {
        id: "seed-attendance-sales-today",
        employeeId: sales.id,
        date: dateOnly(0),
        checkIn: new Date(dateOnly(0).getTime() + 9 * 60 * 60 * 1000),
        status: "Present",
      },
    }),
    prisma.leaveBalance.upsert({
      where: {
        employeeId_year: {
          employeeId: sales.id,
          year: now.getFullYear(),
        },
      },
      update: {
        earnedTotal: 18,
        earnedUsed: 4,
        sickTotal: 8,
        sickUsed: 1,
        casualTotal: 8,
        casualUsed: 2,
      },
      create: {
        id: "seed-leave-balance-sales-current",
        employeeId: sales.id,
        year: now.getFullYear(),
        earnedTotal: 18,
        earnedUsed: 4,
        sickTotal: 8,
        sickUsed: 1,
        casualTotal: 8,
        casualUsed: 2,
      },
    }),
    prisma.expense.upsert({
      where: { id: "seed-expense-mumbai-marketing" },
      update: {
        showroomId: mumbai.id,
        category: "Marketing",
        amount: "185000.00",
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        description: "EV launch campaign and local newspaper ads.",
      },
      create: {
        id: "seed-expense-mumbai-marketing",
        showroomId: mumbai.id,
        category: "Marketing",
        amount: "185000.00",
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        description: "EV launch campaign and local newspaper ads.",
      },
    }),
    prisma.dailySalesSummary.upsert({
      where: {
        date_showroomId: {
          date: dateOnly(0),
          showroomId: mumbai.id,
        },
      },
      update: {
        carsSold: 2,
        revenue: "3620800.00",
        testDrives: 7,
        newLeads: 14,
      },
      create: {
        id: "seed-daily-summary-mumbai-today",
        date: dateOnly(0),
        showroomId: mumbai.id,
        carsSold: 2,
        revenue: "3620800.00",
        testDrives: 7,
        newLeads: 14,
      },
    }),
    prisma.monthlyRevenueSummary.upsert({
      where: {
        month_year_showroomId: {
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          showroomId: mumbai.id,
        },
      },
      update: {
        totalRevenue: "33250000.00",
        totalExpenses: "4650000.00",
        grossProfit: "5180000.00",
        carsSold: 18,
        newCustomers: 23,
        avgDealSize: "1847222.22",
      },
      create: {
        id: "seed-monthly-summary-mumbai-current",
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        showroomId: mumbai.id,
        totalRevenue: "33250000.00",
        totalExpenses: "4650000.00",
        grossProfit: "5180000.00",
        carsSold: 18,
        newCustomers: 23,
        avgDealSize: "1847222.22",
      },
    }),
  ]);

  await Promise.all([
    prisma.offer.upsert({
      where: { id: "seed-offer-volt-launch" },
      update: {
        title: "Volt E1 Launch Bonus",
        description: "Introductory benefit on booking the Volt E1 this month.",
        discountPercent: "4.50",
        carModelId: volt.id,
        validFrom: dateOnly(-5),
        validTill: dateOnly(25),
        isActive: true,
      },
      create: {
        id: "seed-offer-volt-launch",
        title: "Volt E1 Launch Bonus",
        description: "Introductory benefit on booking the Volt E1 this month.",
        discountPercent: "4.50",
        carModelId: volt.id,
        validFrom: dateOnly(-5),
        validTill: dateOnly(25),
        isActive: true,
      },
    }),
    prisma.wishlist.upsert({
      where: {
        customerId_carModelId: {
          customerId: vikram.id,
          carModelId: availableTerra.carModelId,
        },
      },
      update: { priceAlertEnabled: true },
      create: {
        id: "seed-wishlist-vikram-terra",
        customerId: vikram.id,
        carModelId: availableTerra.carModelId,
        priceAlertEnabled: true,
      },
    }),
    prisma.carConfiguration.upsert({
      where: { id: "seed-config-fatima-volt" },
      update: {
        customerId: fatima.id,
        carModelId: reservedVolt.carModelId,
        selectedColor: "Electric Blue",
        interiorType: "Charcoal fabric",
        addons: ["Home charger", "Extended warranty"],
        basePrice: "1890000.00",
        addonsPrice: "65000.00",
        gst: "351720.00",
        totalPrice: "2306720.00",
        financeType: "Cash",
        status: "QuoteSent",
      },
      create: {
        id: "seed-config-fatima-volt",
        customerId: fatima.id,
        carModelId: reservedVolt.carModelId,
        selectedColor: "Electric Blue",
        interiorType: "Charcoal fabric",
        addons: ["Home charger", "Extended warranty"],
        basePrice: "1890000.00",
        addonsPrice: "65000.00",
        gst: "351720.00",
        totalPrice: "2306720.00",
        financeType: "Cash",
        status: "QuoteSent",
      },
    }),
    prisma.cannedResponse.upsert({
      where: { id: "seed-canned-response-delivery" },
      update: {
        title: "Delivery timeline update",
        content:
          "Your delivery coordinator will share the registration and handover status by end of day.",
        category: "Delivery",
        createdById: support.id,
      },
      create: {
        id: "seed-canned-response-delivery",
        title: "Delivery timeline update",
        content:
          "Your delivery coordinator will share the registration and handover status by end of day.",
        category: "Delivery",
        createdById: support.id,
      },
    }),
    prisma.kbArticle.upsert({
      where: { id: "seed-kb-emi-prepayment" },
      update: {
        title: "EMI prepayment process",
        content:
          "Customers can request a loan prepayment statement from the finance desk before paying additional principal.",
        category: "EMI",
        isPublic: true,
        useCount: 18,
        createdById: manager.id,
      },
      create: {
        id: "seed-kb-emi-prepayment",
        title: "EMI prepayment process",
        content:
          "Customers can request a loan prepayment statement from the finance desk before paying additional principal.",
        category: "EMI",
        isPublic: true,
        useCount: 18,
        createdById: manager.id,
      },
    }),
  ]);

  const opening = await prisma.jobOpening.upsert({
    where: { id: "seed-job-sales-executive-pune" },
    update: {
      title: "Sales Executive",
      department: "Sales",
      location: "Pune",
      jobType: "FullTime",
      description: "Own walk-in consultations, test-drive follow-ups, and deals.",
      requirements: "Two years of automotive sales experience preferred.",
      salaryRange: "INR 4.5L - 6.5L",
      openingsCount: 3,
      isActive: true,
    },
    create: {
      id: "seed-job-sales-executive-pune",
      title: "Sales Executive",
      department: "Sales",
      location: "Pune",
      jobType: "FullTime",
      description: "Own walk-in consultations, test-drive follow-ups, and deals.",
      requirements: "Two years of automotive sales experience preferred.",
      salaryRange: "INR 4.5L - 6.5L",
      openingsCount: 3,
      isActive: true,
    },
  });

  await Promise.all([
    prisma.jobApplication.upsert({
      where: { applicationId: "VC-APP-2026-0001" },
      update: {
        jobOpeningId: opening.id,
        applicantName: "Tanmay Joshi",
        email: "tanmay.joshi@example.com",
        phone: "+91-7000000001",
        resumeUrl: "https://cdn.example.com/resumes/tanmay-joshi.pdf",
        coverLetter: "I have handled premium car sales for three years.",
        status: "Shortlisted",
        notes: "Strong dealership experience.",
      },
      create: {
        id: "seed-job-application-tanmay",
        jobOpeningId: opening.id,
        applicantName: "Tanmay Joshi",
        email: "tanmay.joshi@example.com",
        phone: "+91-7000000001",
        resumeUrl: "https://cdn.example.com/resumes/tanmay-joshi.pdf",
        coverLetter: "I have handled premium car sales for three years.",
        applicationId: "VC-APP-2026-0001",
        status: "Shortlisted",
        notes: "Strong dealership experience.",
      },
    }),
    prisma.customerActivityLog.upsert({
      where: { id: "seed-activity-vikram-wishlist" },
      update: {
        customerId: vikram.id,
        actionType: "Wishlist",
        metadata: { carModel: "Terra X", source: "customer-website" },
        ipAddress: "203.0.113.42",
      },
      create: {
        id: "seed-activity-vikram-wishlist",
        customerId: vikram.id,
        actionType: "Wishlist",
        metadata: { carModel: "Terra X", source: "customer-website" },
        ipAddress: "203.0.113.42",
      },
    }),
    prisma.pipelineLog.upsert({
      where: { id: "seed-pipeline-nightly-summary" },
      update: {
        pipelineName: "nightly-sales-summary",
        status: "Success",
        recordsProcessed: 128,
        startedAt: addDays(-1),
        completedAt: addDays(-1),
        errorMsg: null,
      },
      create: {
        id: "seed-pipeline-nightly-summary",
        pipelineName: "nightly-sales-summary",
        status: "Success",
        recordsProcessed: 128,
        startedAt: addDays(-1),
        completedAt: addDays(-1),
        errorMsg: null,
      },
    }),
    prisma.notification.upsert({
      where: { id: "seed-notification-isha-service" },
      update: {
        recipientId: isha.id,
        recipientType: "Customer",
        title: "Service booking confirmed",
        message: "Your first inspection booking is confirmed.",
        type: "service",
        isRead: false,
        link: "/service-bookings/seed-service-isha-astra",
      },
      create: {
        id: "seed-notification-isha-service",
        recipientId: isha.id,
        recipientType: "Customer",
        title: "Service booking confirmed",
        message: "Your first inspection booking is confirmed.",
        type: "service",
        isRead: false,
        link: "/service-bookings/seed-service-isha-astra",
      },
    }),
  ]);

  console.log("Seed data created successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
