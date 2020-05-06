import ControlBaseDataView from './base-data';
import ColorPicker from '../utils/color-picker';
import GlobalControlSelect from './behaviors/global-select-behavior';

export default class extends ControlBaseDataView {
	ui() {
		const ui = super.ui();

		ui.pickerContainer = '.elementor-color-picker-placeholder';

		return ui;
	}

	behaviors() {
		const behaviors = super.behaviors();

		behaviors.globalControlSelect = {
			behaviorClass: GlobalControlSelect,
			popoverContent: this.getGlobalColors(),
			popoverTitle: elementor.translate( 'global_colors_title' ),
			manageButtonText: elementor.translate( 'manage_global_colors' ),
			tooltipText: elementor.translate( 'global_colors_info' ),
			newGlobalConfirmTitle: elementor.translate( 'create_global_style' ),
		};

		return behaviors;
	}

	applySavedValue() {
		if ( this.colorPicker ) {
			this.colorPicker.picker.setColor( this.getControlValue() );
		} else {
			this.initPicker();
		}
	}

	initPicker() {
		const options = {
			picker: {
				el: this.ui.pickerContainer[ 0 ],
				default: this.getControlValue(),
				components: {
					opacity: this.model.get( 'alpha' ),
				},
			},
			onChange: () => this.onPickerChange(),
			onClear: () => this.onPickerClear(),
			onAddButtonClick: () => this.onAddGlobalButtonClick(),
		};

		this.colorPicker = new ColorPicker( options );

		jQuery( this.colorPicker.picker.getRoot().root ).addClass( 'elementor-control-unit-1 elementor-control-tag-area' );
	}

	getColorObject() {
		const color = this.colorPicker.picker.getColor(),
			colorObject = {};

		// color.a is the transparency percentage. 1 means HEX value and not rgba()
		if ( 1 === color.a ) {
			colorObject.code = color.toHEXA().toString( 0 );
			colorObject.displayCode = colorObject.code;
		} else {
			// Format the color code to HEXA for display, but keep rgba() format for CSS implementation
			const transparency = color.a * 100;

			colorObject.code = color.toRGBA().toString( 0 );

			color.a = 1;

			// HEX version of the rgba color for color naming by the NTC library
			colorObject.hexOnly = color.toHEXA().toString( 0 );

			colorObject.displayCode = colorObject.hexOnly + transparency;
		}

		colorObject.name = this.getColorName( colorObject );

		return colorObject;
	}

	getColorName( colorObject ) {
		const color = colorObject.hexOnly ? colorObject.hexOnly : colorObject.code;

		return ntc.name( color )[ 1 ];
	}

	getAddGlobalConfirmMessage() {
		const color = this.getColorObject(),
			$message = jQuery( '<div>', { class: 'elementor-global-confirm-message' } ),
			$messageText = jQuery( '<div>' )
				.html( elementor.translate( 'global_color_confirm_text' ) ),
			$inputWrapper = jQuery( '<div>', { class: 'elementor-global-confirm-input-wrapper' } ),
			$colorPreview = jQuery( '<div>', { class: 'elementor-global-color__preview', style: 'background-color: ' + color.code } ),
			$input = jQuery( '<input>', { type: 'text', name: 'global-name', placeholder: color.name } )
				.val( color.name );

		$inputWrapper.append( $colorPreview, $input );

		$message.append( $messageText, $inputWrapper );

		$message.data( 'globalData', color );

		return $message;
	}

	createGlobalPreviewMarkup( color ) {
		// This method is called without a color parameter when the user clicks the "Add" button
		if ( ! color ) {
			color = this.getColorObject();
		}

		const $color = jQuery( '<div>', { class: 'elementor-global-preview elementor-global-color', 'data-elementor-global-name': color.name } ),
			$colorPreview = jQuery( '<div>', { class: 'elementor-global-color__preview', style: 'background-color: ' + color.code } ),
			$colorTitle = jQuery( '<span>', { class: 'elementor-global-color__title' } )
				.html( color.name ),
			$colorHex = jQuery( '<span>', { class: 'elementor-global-color__hex' } )
				.html( color.displayCode );

		$color.append( $colorPreview, $colorTitle, $colorHex );

		// Make the name and hex values easily available for the preview in the confirm dialog
		$color.data( 'globalData', color );

		return $color;
	}

	// TODO: Replace placeholders with real global colors
	getPlaceholderColorsList() {
		return {
			Primary: {
				name: 'Primary',
				code: '#4631DA',
				displayCode: '#4631DA',
			},
			Secondary: {
				name: 'Secondary',
				code: '#71D7F7',
				displayCode: '#71D7F7',
			},
			Text: {
				name: 'Text',
				code: '#495157',
				displayCode: '#495157',
			},
			Accent: {
				name: 'Accent',
				code: '#A4AFB7',
				displayCode: '#A4AFB7',
			},
			OrangeRed: {
				name: 'Orange Red',
				code: '#FF650E',
				displayCode: '#FF650E',
			},
			Crimson: {
				name: 'Crimson',
				code: '#F3113A',
				displayCode: '#F3113A',
			},
			GrassGreen: {
				name: 'Grass Green',
				code: '#048647',
				displayCode: '#048647',
			},
		};
	}

	getGlobalColors() {
		const $globalColorsPreviewContainer = jQuery( '<div>', { class: 'elementor-global-previews-container' } ),
			globalColors = this.getPlaceholderColorsList();

		Object.values( globalColors ).forEach( ( color ) => {
			const $color = this.createGlobalPreviewMarkup( color );

			$globalColorsPreviewContainer.append( $color );
		} );

		this.ui.$globalColorsPreviewContainer = $globalColorsPreviewContainer;

		return $globalColorsPreviewContainer;
	}

	onPickerChange() {
		this.setValue( this.colorPicker.getColor() );
	}

	onPickerClear() {
		this.setValue( '' );
	}

	onAddGlobalButtonClick() {
		this.triggerMethod( 'addGlobalToList', this.getAddGlobalConfirmMessage() );
	}

	onBeforeDestroy() {
		this.colorPicker.destroy();
	}
}
