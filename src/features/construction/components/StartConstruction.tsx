import { useStartConstruction } from "../hooks";

export function StartConstruction() {
  const {
    selectedRowIds
  } = useStartConstruction();

  console.log(selectedRowIds)

  return (
    <div>StartConstruction</div>
  )
}
