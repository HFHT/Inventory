import classes from './../styles/Ribbon.module.css'
import { Center, Menu, Text } from "@mantine/core";
import { IconChevronDown, IconDownload, IconFileTypeCsv, IconFileTypeXls, IconUpload } from "@tabler/icons-react";
import type { TableRibbonType } from '../types';
// import { useTableExport } from '../../context';

export function Export({ label }: TableRibbonType) {
  // const { requestExport } = useTableExport();
  const handleRequest = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, type: 'csv' | 'xls' | 'model') => {
    event.preventDefault()
    console.log(type)
  }
  return (
    <span className={classes.link}>

      <Menu trigger="hover" transitionProps={{ exitDuration: 0 }} withinPortal>
        <Menu.Target>
          <Center>
            <IconDownload size={14} />
            <Text size='sm' visibleFrom='sm' className={classes.linkLeft}>{label}</Text>
            <IconChevronDown size={14} stroke={1.5} />
          </Center>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item leftSection={<IconFileTypeCsv size={14} />}
            onClick={(event) => handleRequest(event, 'csv')}
          >
            Csv
          </Menu.Item>
          <Menu.Item leftSection={<IconFileTypeXls size={14} />}
            onClick={(event) => handleRequest(event, 'xls')}
          >
            Excel
          </Menu.Item>
          <Menu.Item leftSection={<IconUpload size={14} />}
            onClick={(event) => handleRequest(event, 'model')}
          >
            Model
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </span >
  )
}


