export const processWeeklyData = (
  data: { day_of_week: number; total: number }[],
  transactionType: "Income" | "Expense" = "Income"
) => {
  // Days of the week array with Monday starting as index 0
  const days = ["lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const isIncome = transactionType === "Income";

  // Get the current day of the week (0-6, 0 is Sunday)
  const currentDayOfWeek = new Date().getDay();

  // Map current day of the week to our days array index
  const offset = (currentDayOfWeek + 6) % 7;

  // Initialize barData with default values
  let barData = days.map((label, index) => {
    const adjustedIndex = (index + offset) % 7;
    return {
      label: days[adjustedIndex],
      value: 0,
      frontColor: "#d1d5db",
      gradientColor: "#d1d5db",
    };
  });

  console.log("Raw Data:", data); // Log raw data

  data.forEach((item) => {
    // Adjust day index assuming day_of_week is 1 (Monday) to 7 (Sunday)
    const dayIndex = (item.day_of_week - 2 + 6) % 7; // Ensure 0-based index aligns correctly
    console.log(`Processing day_index: ${dayIndex}, day_of_week: ${item.day_of_week}`); // Log each day index

    if (dayIndex >= 0 && dayIndex < 7) {
      barData[dayIndex].value = item.total;

      // Set colors based on the value and transaction type
      if (item.total < 100) {
        barData[dayIndex].frontColor = "#d1d5db";
        barData[dayIndex].gradientColor = "#d1d5db";
      } else {
        barData[dayIndex].frontColor = isIncome ? "#d3ff00" : "#ffab00";
        barData[dayIndex].gradientColor = isIncome ? "#12ff00" : "#ff0000";
      }
    } else {
      console.warn(`Unexpected day_of_week value: ${item.day_of_week}`);
    }
  });

  console.log("Processed Data:", barData); // Log processed data

  return barData;
};
