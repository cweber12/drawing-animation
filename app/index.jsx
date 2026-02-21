import { 
    useColorScheme, 
    Platform, 
    View, 
    Text, 
    Image
} from 'react-native'
import ThemedView from '../components/view/ThemedView';
import { Colors } from '../constants/Colors';
import LinkButton from '../components/button/LinkButton';


const Home = () => {

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const logoSource = require("../assets/favicon.png");
    
    return (
        <>     
            <ThemedView 
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    justifyContent: 'flex-start', 
                    paddingTop: Platform.OS === 'web' ? 80 : 40, 
                    gap: 24,           
                }}
            >
                <View style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                }}>
                                       
                    <Image
                        source={logoSource}
                        style={{ 
                            width: 400, 
                            height: 300, 
                        }}
                        resizeMode="contain"
                    />
                    
                </View>
             
            </ThemedView>
        </>
    )
}

export default Home