import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
// import { getFromDB } from './services/database';
// import { useEffect, useState } from 'react';
import { Text } from '@mantine/core';
import { AppLayout } from './layouts';
import PageManager from './components/app/PageManager';
import { navStructure } from './layouts/navigation/NavStructure';

// const getData = async (setter: any) => {
//   setter(await getFromDB('Construction', 'Inventory'))
// }

export function App() {
  // const [rows, setRows] = useState([])
  // // Sample table data
  // useEffect(() => {
  //   getData(setRows)
  // }, [])


  return (
    <AppLayout navStructure={navStructure}>
      <PageManager />
    </AppLayout>
  );
  // if (rows.length === 0) return <></>
  // return (
  //   <Table data={{ columns, rows }} >
  //     {(rowId) => rowId ? <TestChild rowId={rowId} /> : null}
  //   </Table >
  // );

}

function TestChild({ rowId }: { rowId: string | number | null }) {
  return (
    <Text>Here is the selected Row id: {rowId}</Text>
  )
}