import PriorityListModel from "../schema/PriorityList.model.js";
import StatusListModel from "../schema/StatusList.model.js";

class DataSeeder {
  constructor(model, data) {
    this.model = model;
    this.data = data;
  }

  async seed() {
    const existingCount = await this.model.countDocuments();

    if (existingCount === 0) {
      await this.model.insertMany(this.data);
      console.log(`${this.model.modelName} data seeded successfully`);
    } else {
      console.log(`${this.model.modelName} data already exists, skipping seed`);
    }
  }
}

const priorityListData = [
  {
    name: "High",
    description: "High priority",
  },
  {
    name: "Medium",
    description: "Medium priority",
  },
  {
    name: "Low",
    description: "Low priority",
  },
  {
    name: "Urgent",
    description: "Urgent priority",
  },
  {
    name: "Not Urgent",
    description: "Not Urgent priority",
  },
];

const statusListData = [
  {
    name: "Open",
    description: "Open status",
  },
  {
    name: "In Progress",
    description: "In Progress status",
  },
  {
    name: "On Hold",
    description: "On Hold status",
  },
  {
    name: "Closed",
    description: "Closed status",
  },
  {
    name: "Resolved",
    description: "Resolved status",
  },
  {
    name: "Completed",
    description: "Completed status",
  }
];

export async function seedData() {
  const priorityListSeeder = new DataSeeder(
    PriorityListModel,
    priorityListData
  );
  await priorityListSeeder.seed();
  const statusListSeeder = new DataSeeder(
    StatusListModel,
    statusListData
  );
  await statusListSeeder.seed();
}
