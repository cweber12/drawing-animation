import { StyleSheet, Text, View, useColorScheme} from 'react-native'
import { Colors } from '../../../constants/Colors';
import OptionButton from '../../button/OptionButton';
import { MdDevices } from "react-icons/md";
import { IoMdCloudOutline } from "react-icons/io";


const ExportSvgDropdown = ({
        style,
        onDownloadSvgToDevice,
        onUploadToS3, 

}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    return (
        <View 
            style={[ 
                style, 
                styles.exportOptionsContainer, 
                { 
                    backgroundColor: theme.listItemBackground, 
                    borderBottom: `1px solid ${theme.border}`,
                    borderRight: `1px solid ${theme.border}`,
                    borderLeft: `1px solid ${theme.border}`,
                }

            ]}>
            <OptionButton
                onPress={() => {onDownloadSvgToDevice && onDownloadSvgToDevice();}} >
                <Text 
                    style={[styles.text, { color: theme.text }]}> 
                    Download to Device 
                </Text> 
                <MdDevices
                    size={24}
                    color={theme.icon} 
                />        
            </OptionButton>
            
            <OptionButton
                onPress={() => {  onUploadToS3 && onUploadToS3();}}>
                <Text 
                    style={[ styles.text,  { color: theme.text }]}>
                    Upload to S3
                </Text>
                <IoMdCloudOutline
                    size={24}
                    color={theme.icon}
                />
            </OptionButton>

        </View>
    )
}

export default ExportSvgDropdown

const styles = StyleSheet.create({
    
    exportOptionsContainer: {
        display: 'flex',
        width: '240px',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-end',
        textAlign: 'left',
        backdropFilter: 'blur(6px)', 
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        padding: 0,
    },

    text: {
        fontSize: 16,
    },
})
