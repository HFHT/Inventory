
type ConstructionCategories = {
    category: '' | 'Appliances' | 'BldgMat' | 'Cabinet' | 'Door' | 'Electrical' | 'Lumber' | 'Paint' | 'Plumbing' |
    'Supplies' | 'Assemblies' | 'Pallet' | 'Windows'
}

export  function Construction({category}:ConstructionCategories) {
  return (
    <div>Construction</div>
  )
}
