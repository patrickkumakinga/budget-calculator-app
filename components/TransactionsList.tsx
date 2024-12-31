import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Category, Transaction } from '../types';
import TransactionListItem from './TransactionListItem';

export default function TransactionsList({
    transactions,
    categories,
    deleteTransaction,
}: {
    categories: Category[]
    transactions: Transaction[];
    deleteTransaction: (id: number) => Promise<void>;
}) {
  return (
    <View style={{ gap: 5}}>
      {transactions.map((transaction) => {

        const categoryForCurrentItem = categories.find(
            (category) => category.id === transaction.category_id
        )

        return (
            <TouchableOpacity
            key={transaction.id}
            activeOpacity={.8}
            onLongPress={() => deleteTransaction(transaction.id)}
            >
            <TransactionListItem transaction={transaction} categoryInfo={categoryForCurrentItem}/>
            </TouchableOpacity>
        )
      })}
    </View>
  )
}