/**
 * polyfills.ts
 *
 * IMPORTANT: @angular/localize/init MUST be the very first import.
 * ng-bootstrap 18 uses $localize() tagged template strings for
 * accessibility labels inside ngb-datepicker-navigation. Without
 * this import those expressions throw silently at runtime and the
 * entire navigation template renders as empty <!--container-->
 * comments, which is exactly the "header exists but is empty" bug.
 */
import '@angular/localize/init';

/***************************************************************************************************
 * Zone JS is required by default for Angular itself.
 */
import 'zone.js';