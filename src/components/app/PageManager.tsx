import { ErrorBoundary } from "react-error-boundary";
import { useNavigationStore } from "../../stores";
import { GenericErrorFallback } from "../Fallbacks";

export default function PageManager() {
    const { navigation } = useNavigationStore()
    return (<>
        <ErrorBoundary
            FallbackComponent={GenericErrorFallback}
            onError={(e, i) => console.log('Main Level Error Boundary', e, i)}
            onReset={(details) => {
                console.log(details)
            }}
        >
            {navigation.page}
        </ErrorBoundary>
    </>
    )
}
