import React, { useState } from "react";
import { Table, Paper } from "@mantine/core";

/**
 * Type for the primary row data
 */
interface MainRow {
  id: number;
  name: string;
  age: number;
  // Other fields...
  details: SubRow[]; // Second level table data
}

/**
 * Type for the secondary (expanded) row data
 */
interface SubRow {
  id: number;
  info: string;
  value: string;
}

/**
 * TwoLevelTable - A Mantine Table that expands rows to show a sub-table
 * @component
 * @example
 * <TwoLevelTable />
 */
export function TwoLevelTable() {
  // Mock data
  const data: MainRow[] = [
    {
      id: 1,
      name: "Alice",
      age: 27,
      details: [
        { id: 101, info: "Address", value: "New York" },
        { id: 102, info: "Phone", value: "123-456-7890" }
      ]
    },
    {
      id: 2,
      name: "Bob",
      age: 34,
      details: [
        { id: 201, info: "Address", value: "London" },
        { id: 202, info: "Phone", value: "555-234-0987" }
      ]
    }
  ];

  // Tracks which row (by id) is currently expanded
  const [expandedRowIds, setExpandedRowIds] = useState<Set<number>>(new Set());

  /**
   * Handles row click to expand/collapse sub-table
   * @param id Row identifier
   */
  function handleRowClick(id: number) {
    setExpandedRowIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  return (
    <Paper shadow="xs" p="md" radius="md">
      <Table withColumnBorders highlightOnHover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            // React.Fragment: Keys are important!
            <React.Fragment key={row.id}>
              <tr
                style={{ cursor: "pointer" }}
                onClick={() => handleRowClick(row.id)}
              >
                <td>{row.name}</td>
                <td>{row.age}</td>
              </tr>
              {expandedRowIds.has(row.id) && (
                <tr>
                  <td colSpan={2} style={{ padding: 0 }}>
                    <Table
                      striped
                      highlightOnHover
                      withColumnBorders
                      style={{ margin: 8 }}
                    >
                      <thead>
                        <tr>
                          <th>Info</th>
                          <th>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {row.details.map((sub) => (
                          <tr key={sub.id}>
                            <td>{sub.info}</td>
                            <td>{sub.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </Table>
    </Paper>
  );
}