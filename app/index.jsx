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
import HomeOptionButtons from '../components/button_group/HomeOptionButtons';


const Home = () => {

    const logoSource = require("../assets/logo.png");
    
    return (
        <>     
            <ThemedView style={{alignItems: 'flex-start'}} >
                
                <View style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                }}>
                    <HomeOptionButtons />                   
                    <Image
                        source={logoSource}
                        style={{ 
                            width: 500, 
                            height: 400, 
                        }}
                        resizeMode="contain"
                    />
                    
                </View>
                
             
            </ThemedView>
        </>
    )
}

export default Home