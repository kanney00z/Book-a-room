import React, { useState } from 'react';
import { useData } from '../lib/DataContext';
import { Expense, ExpenseCategory } from '../types';
import { Receipt, Plus, Trash2, Calendar, TrendingDown, Filter } from 'lucide-react';
import * as motion from 'motion/react-client';
import { cn } from '../lib/utils';

export default function AdminExpenses() {
  const { expenses, addExpense, deleteExpense } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState<{ title: string; amount: string; category: ExpenseCategory; expense_date: string }>({
    title: '',
    amount: '',
    category: 'utilities',
    expense_date: new Date().toISOString().split('T')[0]
  });

  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  const filteredExpenses = expenses.filter(e => {
    const date = new Date(e.expense_date);
    return date.getMonth() === filterMonth && date.getFullYear() === filterYear;
  });

  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const getCategoryLabel = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'utilities': return 'ค่าสาธารณูปโภค (น้ำ/ไฟ)';
      case 'maintenance': return 'ค่าซ่อมบำรุง/ทำความสะอาด';
      case 'salary': return 'เงินเดือนพนักงาน';
      case 'marketing': return 'ค่าโฆษณา/การตลาด';
      case 'other': return 'อื่นๆ';
    }
  };

  const getCategoryColor = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'utilities': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'maintenance': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'salary': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'marketing': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'other': return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount) return;
    
    await addExpense({
      title: newExpense.title,
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      expense_date: newExpense.expense_date
    });
    
    setShowAddModal(false);
    setNewExpense({
      title: '',
      amount: '',
      category: 'utilities',
      expense_date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 font-display flex items-center gap-3">
            <Receipt className="w-8 h-8 text-rose-500" />
            บัญชีรายจ่าย
          </h2>
          <p className="text-slate-500 mt-1">บันทึกและจัดการรายจ่ายทั้งหมดของหอพัก</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-rose-600 text-white px-5 py-2.5 rounded-xl hover:bg-rose-700 transition shadow-md hover:shadow-rose-500/20 flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" /> เพิ่มรายจ่ายใหม่
        </button>
      </div>

      {/* Filter and Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-500 mb-2 font-medium">
              <Filter className="w-4 h-4" /> เลือกเดือนที่ต้องการดู
            </div>
            <div className="flex gap-2">
              <select 
                value={filterMonth}
                onChange={e => setFilterMonth(parseInt(e.target.value))}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                {Array.from({length: 12}).map((_, i) => (
                  <option key={i} value={i}>เดือน {i + 1}</option>
                ))}
              </select>
              <select 
                value={filterYear}
                onChange={e => setFilterYear(parseInt(e.target.value))}
                className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                {[2023, 2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-slate-500 text-sm font-medium mb-1">รวมรายจ่ายเดือนนี้</p>
            <h3 className="text-4xl font-display font-bold text-rose-600 flex items-center gap-2">
              <TrendingDown className="w-6 h-6" /> ฿{totalExpense.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="p-4 font-bold text-slate-600 text-sm">วันที่</th>
                  <th className="p-4 font-bold text-slate-600 text-sm">รายการ</th>
                  <th className="p-4 font-bold text-slate-600 text-sm">หมวดหมู่</th>
                  <th className="p-4 font-bold text-slate-600 text-sm text-right">จำนวนเงิน</th>
                  <th className="p-4 font-bold text-slate-600 text-sm text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      ไม่มีบันทึกรายจ่ายในเดือนนี้
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {new Date(expense.expense_date).toLocaleDateString('th-TH')}
                        </div>
                      </td>
                      <td className="p-4 text-slate-800 font-medium">{expense.title}</td>
                      <td className="p-4">
                        <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", getCategoryColor(expense.category))}>
                          {getCategoryLabel(expense.category)}
                        </span>
                      </td>
                      <td className="p-4 text-right font-display font-bold text-rose-600">
                        ฿{expense.amount.toLocaleString()}
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => deleteExpense(expense.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden flex flex-col divide-y divide-slate-100">
            {filteredExpenses.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                ไม่มีบันทึกรายจ่ายในเดือนนี้
              </div>
            ) : (
              filteredExpenses.map((expense) => (
                <div key={expense.id} className="p-5 flex flex-col gap-3 hover:bg-slate-50 transition">
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-bold text-slate-800 text-lg leading-tight">{expense.title}</div>
                    <div className="font-display font-bold text-rose-600 text-lg shrink-0">
                      ฿{expense.amount.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold border", getCategoryColor(expense.category))}>
                        {getCategoryLabel(expense.category)}
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(expense.expense_date).toLocaleDateString('th-TH')}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => deleteExpense(expense.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 bg-slate-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2rem] border border-slate-200 p-6 md:p-8 max-w-md w-full shadow-2xl relative"
          >
            <h3 className="text-xl font-bold text-slate-800 font-display mb-6">เพิ่มรายการรายจ่าย</h3>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">ชื่อรายการ</label>
                <input 
                  type="text" required
                  value={newExpense.title}
                  onChange={e => setNewExpense({...newExpense, title: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium"
                  placeholder="เช่น ค่าล้างแอร์ 3 เครื่อง"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">จำนวนเงิน (บาท)</label>
                  <input 
                    type="number" required min="0" step="0.01"
                    value={newExpense.amount}
                    onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium font-display text-rose-600"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">วันที่</label>
                  <input 
                    type="date" required
                    value={newExpense.expense_date}
                    onChange={e => setNewExpense({...newExpense, expense_date: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">หมวดหมู่</label>
                <select 
                  value={newExpense.category}
                  onChange={e => setNewExpense({...newExpense, category: e.target.value as ExpenseCategory})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium text-slate-700"
                >
                  <option value="utilities">ค่าสาธารณูปโภค (น้ำ/ไฟ)</option>
                  <option value="maintenance">ค่าซ่อมบำรุง/ทำความสะอาด</option>
                  <option value="salary">เงินเดือนพนักงาน</option>
                  <option value="marketing">ค่าโฆษณา/การตลาด</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-md hover:shadow-rose-600/20 transition-all flex justify-center items-center gap-2"
                >
                  <Plus className="w-5 h-5" /> บันทึกรายจ่าย
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
