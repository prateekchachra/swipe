import React, {Component} from 'react';
import {View, Animated,
PanResponder, Dimensions, LayoutAnimation, UIManager} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRES =  0.25 * SCREEN_WIDTH;
class Deck extends Component {

 

    forceSwipe(direction){

        const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
        Animated.timing(this.state.position, {
            toValue: {x, y: 0},
            duration: 250,

        }).start(() => this.onSwipeComplete());
    }

    onSwipeComplete(direction){

        const {onSwipeLeft, onSwipeRight, data} = this.props;
        const item = data[this.state.index];

        direction === 'right' ? onSwipeRight() : onSwipeLeft();
        this.state.position.setValue({x: 0, y: 0});
        this.setState({ index : this.state.index + 1});
    }

    componentWillUpdate(){
        UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

        LayoutAnimation.spring(); //Changes ANYTHING that changes.

    }

    resetPosition(){
        Animated.spring(
            this.state.position,
            {
                toValue: {x: 0, y : 0}
            }

        ).start();

    }

    constructor(props){
        super(props);

        const position = new Animated.ValueXY();
        const panResp = PanResponder.create({
            onStartShouldSetPanResponder: () => {
                return false;
            }, //touch event k lie responsible
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (event, gesture) => {
                position.setValue({x: gesture.dx, y: gesture.dy});

            },
            onPanResponderRelease: (event, gesture) => {
                if(gesture.dx > SWIPE_THRES){
                    this.forceSwipe('right')
                }
                else if(gesture.dx < -SWIPE_THRES){
                    this.forceSwipe('left')
                }
                else{
                 this.resetPosition();
                }
            }, 

        });


        this.state = {panResp, position, index: 0};
    }


    getCardStyle(){

        const {position} = this.state;
        const rotate = position.x.interpolate({
            inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
            outputRange: ['-120deg', '0deg', '120deg'],
            
        });
        
        return {
            ...position.getLayout(),
            transform: [{rotate: rotate}]
        };

    }
    renderCards(){
        if(this.state.index >= this.props.data.length){
            return this.props.renderNoMoreCards();
        }
        return this.props.data.map((item, i) => {
            console.log(i);
            if(i < this.state.index) return null;
            if(i === this.state.index){
                return(
                    <Animated.View
                    key={item.id}
                    style={[this.getCardStyle(), styles.cardStyle]}
                    {...this.state.panResp.panHandlers}>
                        {this.props.renderCard(item)}
                    </Animated.View>

                );
             }

            return (
                <Animated.View key={item.id} style={[styles.cardStyle,
                {top: 10* (i-this.state.index)}]}
                >
                {this.props.renderCard(item)}
                </Animated.View>);
             
        }).reverse();

    }
    render(){
        return(

            <View>
                {this.renderCards()}
            </View>

        );
        }
}


Deck.defaultProps = {
onSwipeRight: () => {},
onSwipeLeft: () => {},  
}


const styles = {

    cardStyle:{
        position: 'absolute',
        width: SCREEN_WIDTH,

    }

}

export default Deck;
