"use client";
import React, { useState } from 'react';
import { Amplify } from "aws-amplify";
import { generateClient as apiClientGenerator, GraphQLResult, GraphQLSubscription } from "aws-amplify/api";
import { AiOutlineDelete, AiTwotoneEdit } from "react-icons/ai";
import { CSVLink } from 'react-csv';
import { Button, View, withAuthenticator } from "@aws-amplify/ui-react";
import { createStock as createStockMutation, deleteStock as deleteStockMutation, updateStock as updateStockMutation } from "../../../src/graphql/mutations";
import type { WithAuthenticatorProps } from "@aws-amplify/ui-react";
import config from "../src/amplifyconfiguration.json";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(config);

const initialData = {
  id: "",
  name: "",
  price: "",
  category: "",
};

interface Item {
  id: string;
  name: string;
  price: string;
  category: string;
}

const initialCategories: string[] = ["Electronics", "Clothing", "Books"];

const CrudComponent: React.FC = () => {
  const [data, setData] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);


  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>('');
  const [inputPrice, setInputPrice] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPrice(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddItem = () => {
    if (inputValue.trim() !== '' && inputPrice.trim() !== '') {
      const newItem: Item = { id: Date.now().toString(), name: inputValue, price: inputPrice, category: selectedCategory };
      setData([...data, newItem]);
      setInputValue('');
      setInputPrice('');
      setSelectedCategory('');
    }
  };

  const handleEditItem = (id: string) => {
    const itemToEdit = data.find(item => item.id === id);
    if (itemToEdit) {
      setInputValue(itemToEdit.name);
      setInputPrice(itemToEdit.price);
      setSelectedCategory(itemToEdit.category);
    
      setEditingItem(id);
    }
  };

  const handleUpdateItem = () => {
    if (editingItem !== null && inputValue.trim() !== '' && inputPrice.trim() !== '') {
      setData(data.map(item => {
        if (item.id === editingItem) {
          return { ...item, name: inputValue, price: inputPrice, category: selectedCategory };
        }
        return item;
      }));
      setInputValue('');
      setInputPrice('');
      setSelectedCategory('');
      setEditingItem(null);
    }
  };

  const handleDeleteItem = (id: string) => {
    setData(data.filter(item => item.id !== id));
  };

  // Filter data based on search query
  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // CSV data for download
  const csvData: any[] = [
    ['Product Name', 'Price', 'Category'],
    ...filteredData.map(item => [item.name, item.price, item.category])
  ];

  return (
    <div className="mt-10">
      <div className="flex mb-4 justify-center items-center">
      <label htmlFor="categorySelect">Choose a category:</label>
      <select 
        id="categorySelect"
        value={selectedCategory} 
        onChange={handleCategoryChange} 
        className="p-2 border select select-primary rounded mr-2 w-40"
        aria-label="Category selection"
      >
        <option value="">Select Category</option>
        {categories.map((category, index) => (
          <option key={index} value={category}>{category}</option>
        ))}
      </select>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter item name"
          className="p-2 border border-gray-300 rounded mr-2 color-primary"
        />
        <input
          type="text"
          value={inputPrice}
          onChange={handlePriceChange}
          placeholder="Enter the price"
          className="p-2 border border-gray-300 rounded mr-2"
        />
        {editingItem !== null ? (
          <button onClick={handleUpdateItem} className="btn btn-primary mr-4 mb-2 ">
            Update
          </button>
        ) : (
          <button onClick={handleAddItem} className="btn btn-primary mr-4 mb-2">
            Add
          </button>
        )}
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search items"
          className="p-2 border border-gray-300 rounded mr-2"
        />
        <CSVLink data={csvData} filename={"product_data.csv"} className="btn btn-primary mr-2 mb-2" target="_blank">
          Download CSV
        </CSVLink>
      </div>

      <div>
        <table className="table-fixed border-collapse border border-gray-400 w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 w-1/3">Product Name</th>
              <th className="px-4 py-2 w-1/4">Price</th>
              <th className="px-4 py-2 w-1/4">Category</th>
              <th className="px-4 py-2 w-1/4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(item => (
              <tr key={item.id} className="border-b border-gray-400">
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">${item.price}</td>
                <td className="px-4 py-2">{item.category}</td>
                <td className="px-4 py-2">
                <button onClick={() => handleEditItem(item.id)} className="btn btn-primary mr-2" aria-label="Edit item">
                <AiTwotoneEdit />
              </button>
              <button onClick={() => handleDeleteItem(item.id)} className="btn btn-primary" aria-label="Delete item">
                <AiOutlineDelete />
              </button>
              
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CrudComponent;
