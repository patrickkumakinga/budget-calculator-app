import { AntDesign } from "@expo/vector-icons";
import { View, Text, StyleSheet } from 'react-native';
import React from 'react'
import { Category, Transaction } from '../types';
import { AutoSizeText, ResizeTextMode} from 'react-native-auto-size-text';
import { categoryColors, categoryEmojies } from '../constants';
import Card from './uIx/Card';


interface TransactionListItemProps {
    // id: number;
    // category_id: number;
    // amount: number;
    // date: number;
    // description: string;
    // type: "Expense" | "Income"; 
    // or you can do this:
    transaction: Transaction;
    categoryInfo: Category | undefined;
}

export default function TransactionListItem({transaction, categoryInfo}: TransactionListItemProps) {
  const iconName = transaction.type === "Expense" ? "minuscircle" : "pluscircle";
  const color = transaction.type === "Expense" ? "red" : "green";
  const categoryColor = categoryColors[categoryInfo?.name ?? "Default"];
  const emoji = categoryEmojies[categoryInfo?.name ?? "Default"];
  return (
    <Card>
      <View style={styles.row}>
        <View style={{ gap: 3}}>
          <Amount amount={transaction.amount} color={color} iconName={iconName} />
          <CategoryItem 
            categoryColor={categoryColor}
            categoryInfo={categoryInfo}
            emoji={emoji}
          />
        </View>
        <TransactionInfo date={transaction.date} description={transaction.description} id={transaction.id} />
      </View>
    </Card>
  );
}

function TransactionInfo({
  id,
  date, 
  description,
} : {
  id: number;
  date: number;
  description: string;
}) {
  return (
    <View style={{ flexGrow: 1, gap: 6, flexShrink: 1}}>
      <Text style={{ fontSize: 16, fontWeight: "bold"}}>
         {description}
      </Text>
      <Text> Transaction number {id} </Text>
      <Text style={{ fontSize: 12, color: "gray"}}>
        {new Date(date * 1000).toDateString()}
      </Text>
    </View>
  );
}

function CategoryItem({
  categoryColor,
  categoryInfo, 
  emoji,
} : {
  categoryColor: string;
  categoryInfo: Category | undefined;
  emoji: string;
}) {
  return (
    <View style={[styles.categoryContainer,
      { backgroundColor: categoryColor + "40"}
    ]}
    >
      <Text style={styles.categoryText}>
        {emoji} {categoryInfo?.name}
      </Text>
    </View>
  );
}

function Amount({iconName, color, amount} : {
  iconName: "minuscircle" | "pluscircle";
  color: string;
  amount: number;
}) {
  return (
    <View style={styles.row}>
      <AntDesign name={iconName} size={18} color={color}/>
      <AutoSizeText 
        fontSize={32}
        mode={ResizeTextMode.max_lines}
        numberOfLines={1}
        style={[styles.amount, {maxWidth: "80%" }]}
      >
        Fc{amount}
      </AutoSizeText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    justifyContent: 'space-between',
    padding: 5,
  },
  categoryContainer: {
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 3,
    alignSelf: 'flex-start',

  },
  categoryText: {
    marginLeft: 8,
    fontSize: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: 32,
    marginLeft: 4,
    color: 'black',
    fontWeight: 'bold'
  },
});

// at 01:20:32
