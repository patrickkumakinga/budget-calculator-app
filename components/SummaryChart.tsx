import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import React from 'react';
import { BarChart, barDataItem } from 'react-native-gifted-charts';
import Card from './uIx/Card';
import { useSQLiteContext } from 'expo-sqlite';
import { processWeeklyData } from '../utils/dataProcessHelpers';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import Ionicons from 'react-native-vector-icons/Ionicons';

enum Period {
  week = "semain",
  month = "mois",
  year = "année",
}

const screenWidth = Dimensions.get('window').width; // Get screen width
const barWidth = 18; // Set your desired bar width
const dynamicSpacing = (screenWidth - 40 - barWidth * 7) / 6; // Calculate dynamic spacing
const dynamicInitialSpacing = 10; // Adjust initial spacing if needed

export default function SummaryChart() {
  const db = useSQLiteContext();
  const [chartData, setChartData] = React.useState<barDataItem[]>([]);
  const [chartPeriod, setChartPeriod] = React.useState<Period>(Period.week);
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  const [currentEndDate, setCurrentEndDate] = React.useState<Date>(new Date());
  const [chartKey, setChartKey] = React.useState<number>(0);
  const [transactionType, setTransactionType] = React.useState<"Income" | "Expense">("Income");

  React.useEffect(() => {
    const fetchData = async () => {
      if (chartPeriod === Period.week) {
        const { endDate, startDate } = getWeekRange(currentDate);
        setCurrentEndDate(new Date(endDate)); // Corrected to endDate
        const data = await fetchWeeklyData(startDate, endDate, transactionType);
        if (data) {
          const formattedData = processWeeklyData(data, transactionType);
          setChartData(formattedData);
          setChartKey((prev) => prev + 1);
        }
      }
    };
    fetchData();
  }, [chartPeriod, currentDate, transactionType]);

  const fetchWeeklyData = async (startDate: number, endDate: number, type: "Income" | "Expense") => {
    try {
      const startDateSeconds = Math.floor(startDate / 1000);
      const endDateSeconds = Math.floor(endDate / 1000);

      console.log("Running SQL Query with params:", [startDateSeconds, endDateSeconds, type]);

      const query = `SELECT strftime('%w', date / 1000, 'unixepoch') + 1 AS day_of_week, SUM(amount) as total 
                    FROM Transactions 
                    WHERE date >= ? AND date <= ? AND type = ? 
                    GROUP BY day_of_week 
                    ORDER BY day_of_week ASC`;

      const result = await db.getAllAsync<{
        day_of_week: number;
        total: number;
      }>(query, [startDateSeconds, endDateSeconds, type]);

      console.log("Raw Query Result:", result);

      return result;
    } catch (e) {
      console.log(e);
    }
  };

  const getWeekRange = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Adjust to start on Monday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    return {
      startDate: Math.floor(startOfWeek.getTime()),
      endDate: Math.floor(endOfWeek.getTime()),
    };
  };

  const handlePreviousWeek = () => {
    setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)));
  };

  const handleNextWeek = () => {
    setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)));
  };

  return (
    <Card style={styles.card}>
      <Text style={styles.textMo}>
        {currentEndDate.toLocaleDateString('fr-CD', { month: "short", timeZone: 'Africa/Kinshasa' })} {""}
        {currentEndDate.getDate()} -{""}
        {currentDate.toLocaleDateString('fr-CD', { month: "short", timeZone: 'Africa/Kinshasa' })} {""}
        {currentDate.getDate()}
      </Text>
      <Text style={styles.textRev}>Total {transactionType === "Expense" ? "Depense" : "Revenu"}</Text>
      <Text style={styles.textTitle}>Fc{chartData.reduce((total, item) => total + item.value, 0).toFixed(2)}</Text>
      <View style={styles.chartContainer}>
        {/* <BarChart
          key={chartKey}
          data={Array.isArray(chartData) ? chartData : []}
          height={200}
          width={230} // Adjusted width
          barWidth={barWidth}
          minHeight={3}
          barBorderRadius={3}
          spacing={dynamicSpacing}
          initialSpacing={dynamicInitialSpacing}
          yAxisThickness={0}
          xAxisThickness={0}
          yAxisTextStyle={{ color: 'gray' }}
          isAnimated
          animationDuration={300}
          backgroundColor={'white'}
          showGradient
        /> */}
      </View>
      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.iconButton}
          onPress={handlePreviousWeek}
        >
          <Ionicons name="chevron-back-circle" size={24} color="gray" />
          <Text style={styles.iconText}>semaine préc</Text>
        </TouchableOpacity>
        <SegmentedControl
          values={["Income", "Expense"]}
          selectedIndex={transactionType === "Income" ? 0 : 1}
          style={{ width: 120 }}
          onChange={(event) => {
            const index = event.nativeEvent.selectedSegmentIndex;
            setTransactionType(index === 0 ? "Income" : "Expense");
          }}
        />
        <TouchableOpacity style={styles.iconButton}
          onPress={handleNextWeek}
        >
          <Ionicons name="chevron-forward-circle" size={24} color="gray" />
          <Text style={styles.iconText}>semaine proch</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 10,
    padding: 10,
  },
  textTitle: {
    fontWeight: "800",
    fontSize: 32,
    marginBottom: 16,
  },
  textRev: {
    fontWeight: "bold",
    fontSize: 15,
    color: "gray",
    marginBottom: 2,
  },
  textMo: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 2,
  },
  chartContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  iconButton: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconText: {
    marginTop: 10,
    color: 'gray',
    fontSize: 10,
    fontWeight: "bold"
  },
});
