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
            <ThemedView style={{alignItems: 'center', position: 'relative'}} >
                
                    <HomeOptionButtons />                   
                    <Image
                        source={logoSource}
                        style={{ 
                            width: 500, 
                            height: 400, 
                        }}
                        resizeMode="contain"
                    />
                            
            </ThemedView>
    )
}

export default Home