import { useNavigationStore } from "../../stores";

export default function PageManager() {
    const { navigation } = useNavigationStore()
    return (<>
        {navigation.page}
    </>
    )
}
