import React from 'react';
import { View, Text, Button, ScrollView, TextStyle, Alert, StyleSheet } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as WebBrowser from 'expo-web-browser';
import TransactionsList from '../components/TransactionsList';
import Card from '../components/uIx/Card';
import AddTransaction from '../components/AddTransaction';
import { Category, Transaction, TransactionByMonth } from '../types';
import SummaryChart from '../components/SummaryChart';

export default function Home() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [transactionsByMonth, setTransactionsByMonth] = React.useState<TransactionByMonth>({
    totalExpenses: 0,
    totalIncome: 0,
  });

  const db = useSQLiteContext();

  React.useEffect(() => {
    db.withTransactionAsync(async () => {
      await getData();
    });
  }, [db]);

  async function getData() {
    try {
      const result = await db.getAllAsync<Transaction>(`SELECT * FROM Transactions ORDER BY date DESC LIMIT 10;`);
      setTransactions(result);

      const categoriesResult = await db.getAllAsync<Category>(`SELECT * FROM Categories;`);
      setCategories(categoriesResult);

      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999);

      const startOfMonthTimestamp = Math.floor(startOfMonth.getTime() / 1000);
      const endOfMonthTimestamp = Math.floor(endOfMonth.getTime() / 1000);

      const transactionsByMonthResult = await db.getAllAsync<TransactionByMonth>(`
        SELECT
          COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0) AS totalExpenses,
          COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0) AS totalIncome
        FROM Transactions
        WHERE date >= ? AND date <= ?;
      `, [startOfMonthTimestamp, endOfMonthTimestamp]);

      if (transactionsByMonthResult.length > 0) {
        setTransactionsByMonth(transactionsByMonthResult[0]);
      } else {
        setTransactionsByMonth({
          totalExpenses: 0,
          totalIncome: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  async function deleteTransaction(id: number) {
    try {
      await db.withTransactionAsync(async () => {
        await db.runAsync(`DELETE FROM Transactions WHERE id = ?;`, [id]);
        await getData();
      });
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  }

  async function insertTransaction(transaction: Transaction) {
    try {
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `
          INSERT INTO Transactions (category_id, amount, date, description, type) VALUES (?, ?, ?, ?, ?);
        `,
          [
            transaction.category_id,
            transaction.amount,
            transaction.date,
            transaction.description,
            transaction.type,
          ]
        );
        await getData();
      });
    } catch (error) {
      console.error("Error inserting transaction:", error);
    }
  }

  const createPDF = async () => {
    try {
      const html = '<h1>Transaction Report</h1><p>This is your transaction report PDF.</p>';
      
      const { uri } = await Print.printToFileAsync({ html });

      console.log("PDF File Path:", uri);

      // Open the PDF in a web browser
      await WebBrowser.openBrowserAsync(uri);

    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <SummaryChart />
      <AddTransaction insertTransaction={insertTransaction} />
      <TransactionSummary 
        totalExpenses={transactionsByMonth.totalExpenses} 
        totalIncome={transactionsByMonth.totalIncome} 
      />
      <TransactionsList 
        categories={categories}
        transactions={transactions}
        deleteTransaction={deleteTransaction}
      />
      {/* <Button title="Generate PDF" onPress={createPDF} /> */}
      <Footer />
    </ScrollView>
  );
}

function TransactionSummary({ totalIncome, totalExpenses }: TransactionByMonth) {
  const savings = totalIncome - totalExpenses;
  const readablePeriod = new Date().toLocaleDateString("fr-FR", {
    month: 'long',
    year: "numeric",
  });

  const getMoneyTextStyle = (value: number): TextStyle => ({
    fontWeight: "bold",
    color: value < 0 ? "#ff4500" : "#2e8b57",
  });

  const formatMoney = (value: number) => {
    const absValue = Math.abs(value).toFixed(2);
    return `${value < 0 ? "-" : ""}Fc${absValue}`;
  };

  return (
    <Card style={styles.container}>
      <Text style={styles.periodTitle}>Résumé pour {readablePeriod}</Text>
      <Text style={styles.summaryText}> 
        Revenu:{" "}
        <Text style={getMoneyTextStyle(totalIncome)}>
          {formatMoney(totalIncome)}
        </Text>
      </Text>
      <Text style={styles.summaryText}>
      Dépenses Totales:{" "}
        <Text style={getMoneyTextStyle(totalExpenses)}>
          {formatMoney(totalExpenses)}
        </Text>
      </Text>
      <Text style={styles.summaryText}>
      Économies:{" "}
        <Text style={getMoneyTextStyle(savings)}>{formatMoney(savings)}</Text>
      </Text>
    </Card>
  );
}

function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        © {new Date().getFullYear()} s!mpleCode. All rights reserved.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 15,
    paddingVertical: 90,
  },
  container: {
    padding: 20,
    margin: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  periodTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 5,
  },
  footer: {
    padding: 20,
    marginTop: 20,
  },
  footerText: {
    color: 'gray',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 'bold'
  },
});
